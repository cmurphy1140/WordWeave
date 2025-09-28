/**
 * Jest unit tests for PoemInput component
 * Tests user interactions, validation, and integration with theme context
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import PoemInput from '../../components/PoemInput';

// Mock the theme context
const mockThemeContext = {
  currentTheme: null,
  isLoadingTheme: false,
  themeError: null,
  generateAndApplyTheme: jest.fn(),
  applyTheme: jest.fn(),
  resetTheme: jest.fn(),
};

// Mock the API service
jest.mock('../../services/api', () => ({
  generatePoem: jest.fn(),
  analyzeTheme: jest.fn(),
}));

const renderWithThemeProvider = (component: React.ReactElement) => {
  return render(
    <ThemeProvider value={mockThemeContext}>
      {component}
    </ThemeProvider>
  );
};

describe('PoemInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all input fields', () => {
      renderWithThemeProvider(<PoemInput />);
      
      expect(screen.getByLabelText(/verb/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adjective/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/noun/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    it('renders with proper accessibility attributes', () => {
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      
      expect(verbInput).toHaveAttribute('type', 'text');
      expect(adjectiveInput).toHaveAttribute('type', 'text');
      expect(nounInput).toHaveAttribute('type', 'text');
      
      expect(verbInput).toHaveAttribute('required');
      expect(adjectiveInput).toHaveAttribute('required');
      expect(nounInput).toHaveAttribute('required');
    });

    it('renders placeholder text correctly', () => {
      renderWithThemeProvider(<PoemInput />);
      
      expect(screen.getByPlaceholderText(/enter a verb/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter an adjective/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter a noun/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('updates input values when user types', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      
      expect(verbInput).toHaveValue('dance');
      expect(adjectiveInput).toHaveValue('graceful');
      expect(nounInput).toHaveValue('butterfly');
    });

    it('clears form after successful submission', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      mockGeneratePoem.mockResolvedValue({
        poem: 'A graceful butterfly dances',
        success: true
      });
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(verbInput).toHaveValue('');
        expect(adjectiveInput).toHaveValue('');
        expect(nounInput).toHaveValue('');
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockGeneratePoem.mockReturnValue(promise);
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      await user.click(submitButton);
      
      // Check loading state
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise!({
        poem: 'A graceful butterfly dances',
        success: true
      });
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const submitButton = screen.getByRole('button', { name: /generate/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/verb is required/i)).toBeInTheDocument();
      expect(screen.getByText(/adjective is required/i)).toBeInTheDocument();
      expect(screen.getByText(/noun is required/i)).toBeInTheDocument();
    });

    it('validates minimum word length', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'a');
      await user.type(adjectiveInput, 'b');
      await user.type(nounInput, 'c');
      await user.click(submitButton);
      
      expect(screen.getByText(/words must be at least 2 characters/i)).toBeInTheDocument();
    });

    it('validates maximum word length', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      const longWord = 'a'.repeat(51);
      await user.type(verbInput, longWord);
      await user.type(adjectiveInput, 'beautiful');
      await user.type(nounInput, 'sunset');
      await user.click(submitButton);
      
      expect(screen.getByText(/words must be 50 characters or less/i)).toBeInTheDocument();
    });

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const submitButton = screen.getByRole('button', { name: /generate/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/verb is required/i)).toBeInTheDocument();
      
      const verbInput = screen.getByLabelText(/verb/i);
      await user.type(verbInput, 'dance');
      
      expect(screen.queryByText(/verb is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays API error messages', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      mockGeneratePoem.mockRejectedValue(new Error('API connection failed'));
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/API connection failed/i)).toBeInTheDocument();
      });
    });

    it('handles network timeout errors', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      mockGeneratePoem.mockRejectedValue(new Error('Request timeout'));
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Request timeout/i)).toBeInTheDocument();
      });
    });

    it('shows retry option after error', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      mockGeneratePoem.mockRejectedValue(new Error('API error'));
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/API error/i)).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      
      verbInput.focus();
      expect(verbInput).toHaveFocus();
      
      await user.tab();
      expect(adjectiveInput).toHaveFocus();
      
      await user.tab();
      expect(nounInput).toHaveFocus();
    });

    it('announces form state changes to screen readers', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const submitButton = screen.getByRole('button', { name: /generate/i });
      await user.click(submitButton);
      
      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toBeInTheDocument();
      expect(alertRegion).toHaveTextContent(/verb is required/i);
    });

    it('provides proper ARIA labels and descriptions', () => {
      renderWithThemeProvider(<PoemInput />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Poem generation form');
      
      const verbInput = screen.getByLabelText(/verb/i);
      expect(verbInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('Theme Integration', () => {
    it('calls theme generation after successful poem creation', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      const mockAnalyzeTheme = require('../../services/api').analyzeTheme;
      
      mockGeneratePoem.mockResolvedValue({
        poem: 'A graceful butterfly dances',
        success: true
      });
      mockAnalyzeTheme.mockResolvedValue({
        emotion: { primary: 'joy', intensity: 0.8 },
        colors: { palette: [] },
        animation: { style: 'energetic' }
      });
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockThemeContext.generateAndApplyTheme).toHaveBeenCalledWith('A graceful butterfly dances');
      });
    });

    it('handles theme generation errors gracefully', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      const mockAnalyzeTheme = require('../../services/api').analyzeTheme;
      
      mockGeneratePoem.mockResolvedValue({
        poem: 'A graceful butterfly dances',
        success: true
      });
      mockAnalyzeTheme.mockRejectedValue(new Error('Theme analysis failed'));
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockThemeContext.generateAndApplyTheme).toHaveBeenCalledWith('A graceful butterfly dances');
      });
      
      // Should still show success message even if theme fails
      expect(screen.getByText(/poem generated successfully/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('debounces rapid input changes', async () => {
      const user = userEvent.setup();
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      
      // Rapidly type multiple characters
      await user.type(verbInput, 'dancing', { delay: 10 });
      
      // Should only have the final value
      expect(verbInput).toHaveValue('dancing');
    });

    it('prevents multiple simultaneous submissions', async () => {
      const user = userEvent.setup();
      const mockGeneratePoem = require('../../services/api').generatePoem;
      
      // Create a slow promise
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockGeneratePoem.mockReturnValue(promise);
      
      renderWithThemeProvider(<PoemInput />);
      
      const verbInput = screen.getByLabelText(/verb/i);
      const adjectiveInput = screen.getByLabelText(/adjective/i);
      const nounInput = screen.getByLabelText(/noun/i);
      const submitButton = screen.getByRole('button', { name: /generate/i });
      
      await user.type(verbInput, 'dance');
      await user.type(adjectiveInput, 'graceful');
      await user.type(nounInput, 'butterfly');
      
      // Click submit multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);
      
      // Should only call API once
      expect(mockGeneratePoem).toHaveBeenCalledTimes(1);
      
      // Resolve the promise
      resolvePromise!({
        poem: 'A graceful butterfly dances',
        success: true
      });
    });
  });
});
