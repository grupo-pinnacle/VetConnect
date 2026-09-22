import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewModal } from '../components/ui/ReviewModal';

describe('ReviewModal Component', () => {
  it('should render 1 to 5 star rating selector with ARIA accessibility roles (ADR-023)', () => {
    render(
      <ReviewModal
        isOpen={true}
        consultationId="cons-test-999"
        onClose={vi.fn()}
      />
    );

    // Dialog & Radiogroup
    expect(screen.getByRole('dialog')).toBeDefined();
    const radiogroup = screen.getByRole('radiogroup', {
      name: 'Calificación médica de 1 a 5 estrellas',
    });
    expect(radiogroup).toBeDefined();

    // 5 Stars with role radio
    for (let star = 1; star <= 5; star++) {
      const starRadio = screen.getByTestId(`star-rating-${star}`);
      expect(starRadio).toBeDefined();
      expect(starRadio.getAttribute('role')).toBe('radio');
    }
  });

  it('should allow selecting 5 stars, writing an optional comment, and submitting the review', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <ReviewModal
        isOpen={true}
        consultationId="cons-test-999"
        onClose={handleClose}
        onSuccess={handleSuccess}
        onSubmit={handleSubmit}
      />
    );

    // Initial state: submit button should be disabled because rating is 0
    const submitBtn = screen.getByTestId('submit-review-button');
    expect(submitBtn.hasAttribute('disabled')).toBe(true);

    // Select 5 stars
    const star5 = screen.getByTestId('star-rating-5');
    fireEvent.click(star5);

    // Submit button should now be enabled
    expect(submitBtn.hasAttribute('disabled')).toBe(false);

    // Fill optional comment
    const commentInput = screen.getByTestId('input-review-comment');
    fireEvent.change(commentInput, {
      target: { value: 'Excelente atención veterinaria, muy empática.' },
    });

    // Click submit
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        rating: 5,
        comment: 'Excelente atención veterinaria, muy empática.',
      });
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
