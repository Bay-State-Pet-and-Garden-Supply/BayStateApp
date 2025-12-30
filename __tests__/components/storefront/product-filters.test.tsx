import { render, screen, fireEvent } from '@testing-library/react';
import { ProductFilters } from '@/components/storefront/product-filters';
import { type Brand } from '@/lib/data';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockBrands: Brand[] = [
  { id: '1', name: 'Brand A', slug: 'brand-a', logo_url: null, created_at: '2024-01-01' },
  { id: '2', name: 'Brand B', slug: 'brand-b', logo_url: null, created_at: '2024-01-01' },
];

describe('ProductFilters', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders Filters heading', () => {
    render(<ProductFilters brands={mockBrands} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders brand select with options', () => {
    render(<ProductFilters brands={mockBrands} />);
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('All Brands')).toBeInTheDocument();
    expect(screen.getByText('Brand A')).toBeInTheDocument();
    expect(screen.getByText('Brand B')).toBeInTheDocument();
  });

  it('renders availability select', () => {
    render(<ProductFilters brands={mockBrands} />);
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('renders price range inputs', () => {
    render(<ProductFilters brands={mockBrands} />);
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
  });

  it('updates URL when brand is selected', () => {
    render(<ProductFilters brands={mockBrands} />);
    const brandSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(brandSelect, { target: { value: 'brand-a' } });
    expect(mockPush).toHaveBeenCalledWith('/products?brand=brand-a');
  });
});
