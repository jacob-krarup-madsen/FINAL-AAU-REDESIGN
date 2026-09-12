import { vi, describe, beforeEach, it, expect } from 'vitest';
import { within } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/setup/test-utils';
import { screen, fireEvent, act } from '@testing-library/react';
import Support from '@/pages/Support';
import useStore from '@/store';

const mockToast = {
  toast: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
};
const mockSubmitTicket = vi.fn().mockResolvedValue({ success: true });

vi.mock('@/lib/api', () => ({
  submitSupportTicket: (...args: any[]) => mockSubmitTicket(...args),
}));

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe('Support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockSubmitTicket.mockReset();
    mockSubmitTicket.mockResolvedValue({ success: true });
  });

  function renderSupport(lang: 'da' | 'en' = 'da') {
    useStore.setState({ lang });
    return renderWithProviders(<Support />);
  }

  function openForm() {
    act(() => {
      const sidebar = document.querySelector('.support-sidebar');
      if (sidebar) {
        fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: 'Send besked' }));
      }
    });
  }

  function openFormEnglish() {
    act(() => {
      const sidebar = document.querySelector('.support-sidebar');
      if (sidebar) {
        fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: 'Send message' }));
      }
    });
  }

  function fillFields(subject: string, description: string) {
    const subjectInput = screen.getByLabelText(/Emne|Subject/);
    fireEvent.change(subjectInput, { target: { value: subject } });

    const descInput = screen.getByLabelText(/Beskrivelse|Description/);
    fireEvent.change(descInput, { target: { value: description } });
  }

  function submitForm() {
    const form = document.querySelector('form');
    if (form) {
      act(() => {
        fireEvent.submit(form);
      });
    }
  }

  it('renders correctly in Danish', () => {
    renderSupport('da');
    expect(screen.getByText('Hurtige kontaktveje')).toBeInTheDocument();
    const faqBtn = screen.getByText(/Hvordan nulstiller jeg min adgangskode/i);
    fireEvent.click(faqBtn);
    expect(screen.getByText((content) => content.includes('serviceportal.aau.dk'))).toBeInTheDocument();
  });

  it('renders correctly in English', () => {
    renderSupport('en');
    expect(screen.getByText('Quick contacts')).toBeInTheDocument();
    const faqBtn = screen.getByText(/How do I reset my password/i);
    fireEvent.click(faqBtn);
    const ticketTexts = screen.getAllByText((content) => content.includes('serviceportal.aau.dk'));
    expect(ticketTexts.length).toBeGreaterThan(0);
  });

  it('shows error toast when form is submitted with empty fields', () => {
    renderSupport('da');
    openForm();
    submitForm();
    expect(mockToast.error).toHaveBeenCalledWith('Udfyld venligst alle felter');
  });

  it('shows error toast in English when form is submitted with empty fields', () => {
    renderSupport('en');
    openFormEnglish();
    submitForm();
    expect(mockToast.error).toHaveBeenCalledWith('Please fill in all fields');
  });

  it('shows success toast when form is submitted with valid fields', async () => {
    renderSupport('da');
    openForm();
    fillFields('Test emne', 'Test beskrivelse');
    await act(async () => {
      submitForm();
    });
    expect(mockToast.success).toHaveBeenCalledWith('Besked sendt!');
  });

  it('shows success toast in English', async () => {
    renderSupport('en');
    openFormEnglish();
    fillFields('Test subject', 'Test description');
    await act(async () => {
      submitForm();
    });
    expect(mockToast.success).toHaveBeenCalledWith('Message sent!');
  });

  it('shows error toast when submitSupportTicket fails', async () => {
    mockSubmitTicket.mockRejectedValueOnce(new Error('fail'));
    renderSupport('da');
    openForm();
    fillFields('Test emne', 'Test beskrivelse');
    await act(async () => {
      submitForm();
    });
    expect(mockToast.error).toHaveBeenCalledWith('Der opstod en fejl. Prøv igen senere.');
  });

  it('closes form after successful submission', async () => {
    renderSupport('da');
    openForm();
    fillFields('Test emne', 'Test beskrivelse');
    await act(async () => {
      submitForm();
    });
    expect(screen.queryByLabelText(/Emne/)).not.toBeInTheDocument();
    const sidebar1 = document.querySelector('.support-sidebar');
    expect(within(sidebar1 as HTMLElement).getByRole('button', { name: 'Send besked' })).toBeInTheDocument();
  });

  it('disables submit button while form is being sent', async () => {
    let resolveSubmit: any;
    const pendingPromise = new Promise((resolve) => {
      resolveSubmit = resolve;
    });
    mockSubmitTicket.mockReturnValueOnce(pendingPromise);

    renderSupport('da');
    openForm();
    fillFields('Test emne', 'Test beskrivelse');
    
    act(() => {
      submitForm();
    });
    
    const formEl = document.querySelector('form');
    expect(within(formEl as HTMLElement).getByRole('button', { name: 'Send besked' })).toHaveAttribute('aria-disabled', 'true');
    
    await act(async () => {
      resolveSubmit({ success: true });
    });
  });

  it('closes form on cancel', () => {
    renderSupport('da');
    openForm();
    expect(screen.getByLabelText(/Emne/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Annuller'));
    expect(screen.queryByLabelText(/Emne/)).not.toBeInTheDocument();
    const sidebar2 = document.querySelector('.support-sidebar');
    expect(within(sidebar2 as HTMLElement).getByRole('button', { name: 'Send besked' })).toBeInTheDocument();
  });

  it('clears field errors on input change', () => {
    renderSupport('da');
    openForm();
    submitForm();
    const subjectInput = screen.getByLabelText(/Emne/);
    fireEvent.change(subjectInput, { target: { value: 'Something' } });
    expect(mockToast.error).toHaveBeenCalledTimes(1);
  });

  it('clears field errors on textarea change', () => {
    renderSupport('da');
    openForm();
    submitForm();
    const descInput = screen.getByLabelText(/Beskrivelse/);
    fireEvent.change(descInput, { target: { value: 'Something' } });
    expect(mockToast.error).toHaveBeenCalledTimes(1);
  });

  it('renders compact quick contact bar', () => {
    renderSupport('da');
    expect(screen.getAllByText('+45 9940 2020').length).toBeGreaterThan(0);
    expect(screen.getByText('Hurtige kontaktveje')).toBeInTheDocument();
  });

  it('renders service portal quick link', () => {
    renderSupport('da');
    expect(screen.getByText('Serviceportal')).toBeInTheDocument();
  });

  it('renders all location accordions', () => {
    renderSupport('da');
    expect(screen.getByText('Aalborg Øst')).toBeInTheDocument();
    expect(screen.getByText('Aalborg City')).toBeInTheDocument();
    expect(screen.getByText('København')).toBeInTheDocument();
    expect(screen.getByText('Esbjerg')).toBeInTheDocument();
  });

  it('shows opening hours when location accordion is opened', () => {
    renderSupport('da');
    const locBtn = screen.getByText('Aalborg Øst');
    fireEvent.click(locBtn);
    expect(screen.getAllByText(/Mandag - Torsdag/i).length).toBeGreaterThan(0);
    expect(screen.getByText('8.00 - 15.30')).toBeInTheDocument();
  });

  it('renders special opening hours section', () => {
    renderSupport('da');
    expect(screen.getByText(/Særlige åbningstider/i)).toBeInTheDocument();
  });

  it('renders guides and self-service sections', () => {
    renderSupport('da');
    expect(screen.getByText('Vejledninger')).toBeInTheDocument();
    expect(screen.getByText('Selvbetjening')).toBeInTheDocument();
  });

  it('renders chat closed message', () => {
    renderSupport('da');
    expect(screen.getByText(/Chat: Lukket nu/i)).toBeInTheDocument();
  });
});
