import React, { useState, useEffect, useRef } from 'react';
import { Star, X, Loader2, Sparkles } from 'lucide-react';
import { ReviewModalProps, ApiResponse, Review } from '../../types';
import api from '../../services/api';
import { cn } from '../../lib/utils';

const RATING_LABELS: Record<number, string> = {
  1: 'Insatisfactoria',
  2: 'Regular',
  3: 'Buena',
  4: 'Muy buena',
  5: '¡Excelente atención médica!',
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  consultationId,
  onClose,
  onSuccess,
  initialRating = 0,
  initialComment = '',
  isLoading: externalLoading = false,
  onSubmit,
  className = '',
  'data-testid': testId = 'review-modal',
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialComment);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setHoverRating(0);
      setComment(initialComment);
      setError(null);
    }
  }, [isOpen, initialRating, initialComment]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSubmitting = externalLoading || internalLoading;
  const activeRating = hoverRating || rating;

  const handleKeyDownRadiogroup = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(5, (rating || 0) + 1);
      setRating(next);
      starRefs.current[next - 1]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, (rating || 2) - 1);
      setRating(prev);
      starRefs.current[prev - 1]?.focus();
    } else if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      const num = parseInt(e.key, 10);
      setRating(num);
      starRefs.current[num - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Por favor seleccioná una calificación de 1 a 5 estrellas.');
      return;
    }

    setError(null);
    setInternalLoading(true);

    const payload = {
      rating,
      comment: comment.trim() || undefined,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const res = await api.post<ApiResponse<Review>>(
          `/api/consultations/${consultationId}/review`,
          payload
        );

        if (res.data.success) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setError(res.data.message || 'Error al enviar la calificación.');
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        apiErr.response?.data?.error?.message ||
          'No se pudo registrar la calificación médica. Intentá nuevamente.'
      );
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div
      data-testid={testId}
      className="fixed inset-0 bg-[#183c3a]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'bg-[#fffbef] rounded-3xl max-w-md w-full shadow-2xl border border-[#e4dfd2] p-6 relative font-sans text-[#183c3a] my-8',
          className
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 text-[#607674] hover:text-[#183c3a] p-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-[#f8f0dc] border border-[#e4dfd2] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#c19e45] shadow-sm">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2
            id="review-modal-title"
            className="text-xl font-bold font-display text-[#183c3a] tracking-tight"
          >
            ¿Cómo fue tu experiencia clínica?
          </h2>
          <p className="text-xs text-[#454e4e] mt-1 max-w-xs mx-auto">
            Tu valoración médica nos ayuda a cuidar la calidad de atención en HuelliCam.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#fbeee9] border border-[#e98b70]/50 rounded-2xl text-[#ae4d45] text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Interactive Star Rating Selector */}
          <div className="flex flex-col items-center">
            <div
              role="radiogroup"
              aria-label="Calificación médica de 1 a 5 estrellas"
              onKeyDown={handleKeyDownRadiogroup}
              className="flex items-center gap-2 p-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c]"
            >
              {[1, 2, 3, 4, 5].map((star, idx) => {
                const isLit = star <= activeRating;
                const isSelected = star === rating;

                return (
                  <button
                    key={star}
                    ref={(el) => {
                      starRefs.current[idx] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${star} de 5 estrellas - ${RATING_LABELS[star]}`}
                    data-testid={`star-rating-${star}`}
                    tabIndex={rating === star || (rating === 0 && star === 1) ? 0 : -1}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    disabled={isSubmitting}
                    className="p-1 rounded-xl text-[#d4cfc2] hover:scale-110 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] focus-visible:ring-offset-2"
                  >
                    <Star
                      className={cn(
                        'w-8 h-8 transition-colors',
                        isLit
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-[#d4cfc2] stroke-[1.5]'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            {/* Dynamic Label */}
            <p className="text-xs font-semibold h-4 text-center mt-1 text-[#183c3a]">
              {activeRating > 0 ? RATING_LABELS[activeRating] : 'Tocá las estrellas para calificar'}
            </p>
          </div>

          {/* Qualitative Comment Input */}
          <div>
            <label
              htmlFor="review-comment"
              className="block text-xs font-semibold text-[#183c3a] mb-1"
            >
              Comentario sobre la consulta (opcional)
            </label>
            <textarea
              id="review-comment"
              rows={3}
              data-testid="input-review-comment"
              placeholder="Contale al veterinario cómo fue la atención de tu mascota..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 border border-[#e4dfd2] rounded-2xl text-sm bg-white text-[#183c3a] placeholder:text-[#607674]/70 focus:outline-none focus:ring-2 focus:ring-[#609f9c] focus:border-[#609f9c] transition-colors disabled:bg-[#f2eddd]/60 disabled:text-[#607674]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              data-testid="skip-review-button"
              onClick={onClose}
              disabled={isSubmitting}
              className="order-2 sm:order-1 flex-1 px-4 py-2.5 text-[#454e4e] hover:text-[#183c3a] hover:bg-[#f2eddd] rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] disabled:opacity-50 text-center"
            >
              Omitir por ahora
            </button>

            <button
              type="submit"
              data-testid="submit-review-button"
              disabled={isSubmitting || rating === 0}
              className="order-1 sm:order-2 flex-1 px-4 py-2.5 bg-[#609f9c] hover:bg-[#315f5d] text-white rounded-full text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar Calificación</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
