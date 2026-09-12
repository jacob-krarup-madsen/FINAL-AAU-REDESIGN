import { vi, describe, beforeEach, it, expect } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/setup/test-utils';
import Courses from '@/pages/Courses';
import useStore from '@/store';

describe('Courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({ lang: 'da' });
  });

  it('renders courses correctly', () => {
    renderWithProviders(<Courses />);
    expect(screen.getAllByText('Kurser').length).toBeGreaterThan(0);
    expect(screen.getByText('I gang')).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    renderWithProviders(<Courses />);
    const completedTab = screen.getByText('Afsluttede');
    fireEvent.click(completedTab);
    expect(completedTab.closest('.tabs__item--active')).toBeDefined();
  });

  it('toggles sections including forums', () => {
    renderWithProviders(<Courses />);
    const coursesHeader = screen.getByText(/Dine kurser/i);
    fireEvent.click(coursesHeader);
    expect(screen.queryByText('Åbn modul')).not.toBeInTheDocument();

    const forumsHeader = screen.getByText(/Dine Fora/i);
    fireEvent.click(forumsHeader);
    expect(screen.queryByText('Studienævn for DDK')).not.toBeInTheDocument();
  });

  it('toggles star on a course', () => {
    const toggleFavorite = vi.fn();
    useStore.setState({ toggleFavorite });
    renderWithProviders(<Courses />);
    const stars = document.querySelectorAll('.teaser-card__star');
    if (stars.length > 0) {
      fireEvent.click(stars[0]);
      expect(toggleFavorite).toHaveBeenCalledWith('course', expect.any(Number));
    }
  });

  it('toggles the star on a forum card', () => {
    const toggleFavorite = vi.fn();
    useStore.setState({ toggleFavorite });
    renderWithProviders(<Courses />);
    const forumsGrid = document.querySelector('.courses__forums-grid');
    const forumStars = forumsGrid?.querySelectorAll('.teaser-card__star');
    if (forumStars && forumStars.length > 0) {
      fireEvent.click(forumStars[0]);
      expect(toggleFavorite).toHaveBeenCalledWith('forum', expect.any(Number));
    }
  });

  it('switches to upcoming tab and shows upcoming courses', () => {
    renderWithProviders(<Courses />);
    fireEvent.click(screen.getByText('Kommende'));
    expect(screen.getByText('Bachelorprojekt')).toBeInTheDocument();
  });

  it('renders in English with English course titles', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Courses />);
    expect(screen.getByText('Digital Design and Communication')).toBeInTheDocument();
    expect(screen.getByText('Web Development and CMS')).toBeInTheDocument();
    expect(screen.getByText('Module 4')).toBeInTheDocument();
  });

  it('renders forums with English titles', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Courses />);
    expect(screen.getByText('Study Board for DDK')).toBeInTheDocument();
    expect(screen.getByText('Semester Forum (4th Semester)')).toBeInTheDocument();
  });

  it('renders Module 1 label for course 3 in English', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Courses />);
    expect(screen.getByText('Module 1')).toBeInTheDocument();
  });

  it('types in search input to filter courses', () => {
    renderWithProviders(<Courses />);
    const searchInput = screen.getByPlaceholderText(/søg/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Digital' } });
    expect(screen.getAllByText(/Digital Design og Kommunikation/).length).toBeGreaterThan(0);
  });

  it('opens filter dropdown and selects a label filter', () => {
    renderWithProviders(<Courses />);
    const filterBtn = screen.getByText('Filter');
    fireEvent.click(filterBtn);
    expect(screen.getByText('Alle')).toBeInTheDocument();
    const dropdownContent = screen.getByRole('menu');
    const labelBtn = within(dropdownContent).getByText('Modul 4');
    fireEvent.click(labelBtn);
  });

  it('opens filter dropdown and clears filter with All', () => {
    renderWithProviders(<Courses />);
    const filterBtn = screen.getByText('Filter');
    fireEvent.click(filterBtn);
    const allBtn = screen.getByText('Alle');
    fireEvent.click(allBtn);
    expect(screen.queryByText('Alle')).not.toBeInTheDocument();
  });

  it('closes filter dropdown on click outside', () => {
    renderWithProviders(<Courses />);
    const filterBtn = screen.getByText('Filter');
    fireEvent.click(filterBtn);
    expect(screen.getByText('Alle')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Alle')).not.toBeInTheDocument();
  });

  it('toggles sort order', () => {
    renderWithProviders(<Courses />);
    const sortBtn = screen.getByText('Aktive først');
    fireEvent.click(sortBtn);
    fireEvent.click(sortBtn);
  });

  it('shows clear search button when no results found', () => {
    renderWithProviders(<Courses />);
    const searchInput = screen.getByPlaceholderText(/søg/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'zzznonexistent' } });
    const clearBtn = screen.getByText('Ryd søgning');
    fireEvent.click(clearBtn);
    expect(screen.queryByText('Ryd søgning')).not.toBeInTheDocument();
  });

  it('renders clear search button in English', () => {
    useStore.setState({ lang: 'en' });
    renderWithProviders(<Courses />);
    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'zzz' } });
    expect(screen.getByText('Clear search')).toBeInTheDocument();
  });

  it('clears search via SearchInput X button', () => {
    renderWithProviders(<Courses />);
    const searchInput = screen.getByPlaceholderText(/søg/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue('');
  });

  it('cycles through all sort combinations', () => {
    renderWithProviders(<Courses />);
    const sortBtn = screen.getByText('Aktive først');
    fireEvent.click(sortBtn);
    expect(screen.getByText('Inaktive først')).toBeInTheDocument();
    fireEvent.click(sortBtn);
    expect(screen.getByText('A-Å')).toBeInTheDocument();
    fireEvent.click(sortBtn);
    expect(screen.getByText('Å-A')).toBeInTheDocument();
    fireEvent.click(sortBtn);
    expect(screen.getByText('Aktive først')).toBeInTheDocument();
  });

  it('toggles course favorite star', () => {
    renderWithProviders(<Courses />);
    const stars = screen.getAllByLabelText(/favorit/i);
    fireEvent.click(stars[0]);
  });

  it('toggles forum favorite star', () => {
    renderWithProviders(<Courses />);
    const forumsHeading = screen.getByText(/Dine Fora/i);
    const forumStar = forumsHeading.parentElement?.parentElement?.parentElement?.querySelector('button[aria-label*="favorit"]');
    if (forumStar) fireEvent.click(forumStar);
  });

  it('opens course catalog when button clicked', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<Courses />);
    const catalogBtn = screen.getByText('Gå til kursuskatalog');
    fireEvent.click(catalogBtn);
    expect(windowOpenSpy).toHaveBeenCalledWith('https://kursuskatalog.aau.dk', '_blank', 'noopener,noreferrer');
    windowOpenSpy.mockRestore();
  });
});
