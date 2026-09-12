import { vi, describe, beforeEach, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/setup/test-utils';
import Submission, { SubmissionDropzone } from '@/pages/Submission';

const mockSubmitAssignment = vi.fn().mockResolvedValue({ success: true });
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ courseId: '1', assignmentId: '105' }),
  };
});

vi.mock('@/lib/api', () => ({
  submitAssignment: (...args: any[]) => mockSubmitAssignment(...args),
}));

describe('SubmissionDropzone', () => {
  const mockOnFilesAdded = vi.fn();
  const mockT = vi.fn((key: string) => {
    const map: Record<string, string> = {
      click_or_drag: 'Klik eller træk filer',
      submission_or_zip: ' eller ZIP',
    };
    return map[key] || key;
  });

  const renderDropzone = () => {
    return render(<SubmissionDropzone onFilesAdded={mockOnFilesAdded} t={mockT} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dropzone with translated text', () => {
    renderDropzone();
    expect(screen.getByText('Klik eller træk filer')).toBeInTheDocument();
    expect(screen.getByText(/PDF, JPG, PNG/)).toBeInTheDocument();
  });

  it('calls file input click when dropzone is clicked', async () => {
    const userEvent = await import('@testing-library/user-event');
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderDropzone();
    const zone = screen.getByRole('button');
    await userEvent.default.click(zone);
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('calls file input click when Enter is pressed', async () => {
    const userEvent = await import('@testing-library/user-event');
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderDropzone();
    const zone = screen.getByRole('button');
    zone.focus();
    await userEvent.default.keyboard('{Enter}');
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('calls file input click when Space is pressed', async () => {
    const userEvent = await import('@testing-library/user-event');
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderDropzone();
    const zone = screen.getByRole('button');
    zone.focus();
    await userEvent.default.keyboard(' ');
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('sets drag state on dragOver and clears on dragLeave', () => {
    renderDropzone();
    const zone = screen.getByRole('button');

    fireEvent.dragOver(zone);
    expect(zone.className).toContain('border-primary');

    fireEvent.dragLeave(zone);
    expect(zone.className).toContain('border-border');
  });

  it('calls onFilesAdded with files on drop', () => {
    renderDropzone();
    const zone = screen.getByRole('button');
    const files = [new File(['test'], 'test.pdf', { type: 'application/pdf' })];
    const dataTransfer = { files };

    fireEvent.drop(zone, { dataTransfer });
    expect(mockOnFilesAdded).toHaveBeenCalledWith(files);
  });

  it('calls onFilesAdded when file input changes', () => {
    renderDropzone();
    const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' });
    const input = document.getElementById('fileInput') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    expect(mockOnFilesAdded).toHaveBeenCalledWith([file]);
  });

  it('does not trigger file input click on other key presses', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderDropzone();
    const zone = screen.getByRole('button');
    fireEvent.keyDown(zone, { key: 'Tab' })
    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('does not call onFilesAdded when file input change has no files', () => {
    renderDropzone();
    const input = document.getElementById('fileInput') as HTMLInputElement;

    fireEvent.change(input, { target: { files: null } });
    expect(mockOnFilesAdded).not.toHaveBeenCalled();
  });

  it('does not call onFilesAdded on drop when dataTransfer.files is empty', () => {
    renderDropzone();
    const zone = screen.getByRole('button');

    fireEvent.drop(zone, { dataTransfer: { files: null } });
    expect(mockOnFilesAdded).not.toHaveBeenCalled();
  });
});

describe('Submission Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitAssignment.mockReset();
    mockSubmitAssignment.mockResolvedValue({ success: true });
  });

  it('handles file upload', () => {
    renderWithProviders(<Submission />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });
    expect(screen.getByText('hello.png')).toBeInTheDocument();
  });

  it('handles invalid file input (no files selected)', () => {
    renderWithProviders(<Submission />);
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: null } });
    expect(screen.queryByText('hello.png')).not.toBeInTheDocument();
  });

  it('handles file processing error (e.g. non-file object in file list)', () => {
    renderWithProviders(<Submission />);
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;

    // Create aFileList-like object that isn't empty but lacks expected file structure
    const invalidFiles = {
      item: () => null,
      length: 1,
      0: {},
    };

    fireEvent.change(hiddenInput, { target: { files: invalidFiles } });
    expect(screen.queryByText('hello.png')).not.toBeInTheDocument();
  });

  it('removes file', () => {
    renderWithProviders(<Submission />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    const removeBtn = document.querySelector('.submission__remove-btn') as HTMLButtonElement;
    fireEvent.click(removeBtn);

    expect(screen.queryByText('hello.png')).not.toBeInTheDocument();
  });

  it('navigates to course when back to course is clicked', async () => {
    renderWithProviders(<Submission />);

    // Trigger submission success
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });
    const submitBtn = screen.getByRole('button', { name: /Aflevér opgave/i });
    fireEvent.click(submitBtn);

    // Find text asynchronously
    const successMsg = await screen.findByText(/Din aflevering er modtaget/i, {}, { timeout: 5000 });
    expect(successMsg).toBeInTheDocument();

    // Click 'Back to course'
    const backBtn = screen.getByRole('button', { name: /Tilbage til kursus/i });
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/course/1');
  });

  it('handles uploading state', () => {
    renderWithProviders(<Submission />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: /Aflevér opgave/i });
    fireEvent.click(submitBtn);

    expect(submitBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles file upload change with empty list', () => {
    renderWithProviders(<Submission />);
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [] } });
    expect(screen.queryByText('hello.png')).not.toBeInTheDocument();
  });

  it('handles submitAssignment failure and returns to draft', async () => {
    mockSubmitAssignment.mockRejectedValueOnce(new Error('fail'));
    renderWithProviders(<Submission />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const hiddenInput = document.querySelector('#fileInput') as HTMLInputElement;
    fireEvent.change(hiddenInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /Aflevér opgave/i }));
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: /Aflevér opgave/i })).not.toBeDisabled();
    });
  });

  it('types in the comment textarea', () => {
    renderWithProviders(<Submission />);
    const textarea = screen.getByPlaceholderText('Skriv en kommentar...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    expect(textarea).toHaveValue('Test comment');
  });
});
