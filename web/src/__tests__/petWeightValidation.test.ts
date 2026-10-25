import { describe, it, expect } from 'vitest';
import { getWeightAssessment, BREED_WEIGHT_STANDARDS, SPECIES_WEIGHT_LIMITS } from '../lib/petWeightValidation';

describe('Pet Weight Validation and Biometric Standards', () => {
  it('should return null when weight is not provided or zero/negative', () => {
    expect(getWeightAssessment('Perro', 'Labrador Retriever', undefined)).toBeNull();
    expect(getWeightAssessment('Perro', 'Labrador Retriever', null as any)).toBeNull();
    expect(getWeightAssessment('Perro', 'Labrador Retriever', 0)).toEqual(
      expect.objectContaining({
        status: 'too_low',
        isBlocking: true,
      })
    );
  });

  it('FEAT-02: should accept undefined / null weight as optional without blocking or error', () => {
    expect(getWeightAssessment('Perro', 'Labrador Retriever', undefined)).toBeNull();
    expect(getWeightAssessment('Perro', 'Labrador Retriever', null as any)).toBeNull();
    expect(getWeightAssessment('Gato', 'Común Europeo', undefined)).toBeNull();
  });

  it('should assess standard healthy weight as valid_ideal for a known breed', () => {
    // Labrador: ideal is 25 - 36 kg
    const assessment = getWeightAssessment('Perro', 'Labrador Retriever', 30);
    expect(assessment).not.toBeNull();
    expect(assessment?.status).toBe('valid_ideal');
    expect(assessment?.isBlocking).toBe(false);
    expect(assessment?.message).toContain('promedio esperado');
  });

  it('should assess underweight or puppy weight within biological limits as valid_divergent', () => {
    // Labrador: biological min is ~3.5 kg, ideal starts at 25 kg. 10 kg is a puppy / underweight
    const assessment = getWeightAssessment('Perro', 'Labrador Retriever', 10);
    expect(assessment).not.toBeNull();
    expect(assessment?.status).toBe('valid_divergent');
    expect(assessment?.isBlocking).toBe(false);
    expect(assessment?.message).toContain('fuera del promedio');
  });

  it('should flag weight below absolute minimum as too_low and blocking', () => {
    // Labrador: minPossibleKg is ~3.5 kg. 0.2 kg is physiologically impossible (likely grams or typo)
    const assessment = getWeightAssessment('Perro', 'Labrador Retriever', 0.2);
    expect(assessment).not.toBeNull();
    expect(assessment?.status).toBe('too_low');
    expect(assessment?.isBlocking).toBe(true);
    expect(assessment?.message).toContain('demasiado bajo');
  });

  it('should flag weight above absolute maximum as too_high and blocking', () => {
    // Chihuahua: maxPossibleKg is ~5.5 kg. 25 kg is physically impossible for a Chihuahua
    const assessment = getWeightAssessment('Perro', 'Chihuahua', 25);
    expect(assessment).not.toBeNull();
    expect(assessment?.status).toBe('too_high');
    expect(assessment?.isBlocking).toBe(true);
    expect(assessment?.message).toContain('supera el límite');
  });

  it('should correctly handle cats and their physiological extremes', () => {
    // Maine Coon: maxPossibleKg is ~18 kg, ideal 5.5 - 11 kg.
    const ideal = getWeightAssessment('Gato', 'Maine Coon', 8);
    expect(ideal?.status).toBe('valid_ideal');
    expect(ideal?.isBlocking).toBe(false);

    // Morbidly obese cat of 14 kg is still within extreme possible for Maine Coon
    const obese = getWeightAssessment('Gato', 'Maine Coon', 14);
    expect(obese?.status).toBe('valid_divergent');
    expect(obese?.isBlocking).toBe(false);

    // 45 kg cat is impossible
    const impossible = getWeightAssessment('Gato', 'Maine Coon', 45);
    expect(impossible?.status).toBe('too_high');
    expect(impossible?.isBlocking).toBe(true);
  });

  it('should handle small pets like birds and rodents with gram-scale precision in kg', () => {
    // Canario: 0.020 kg (20g) is ideal
    const canaryIdeal = getWeightAssessment('Ave', 'Canario', 0.02);
    expect(canaryIdeal?.status).toBe('valid_ideal');
    expect(canaryIdeal?.isBlocking).toBe(false);

    // 5 kg canary is impossible
    const canaryImpossible = getWeightAssessment('Ave', 'Canario', 5);
    expect(canaryImpossible?.status).toBe('too_high');
    expect(canaryImpossible?.isBlocking).toBe(true);
  });

  it('should fall back to species limits when breed is unknown or generic', () => {
    const fallback = getWeightAssessment('Perro', 'Raza Desconocida Inventada', 35);
    expect(fallback).not.toBeNull();
    expect(fallback?.isBlocking).toBe(false);

    const impossibleFallback = getWeightAssessment('Perro', 'Raza Desconocida Inventada', 300);
    expect(impossibleFallback?.status).toBe('too_high');
    expect(impossibleFallback?.isBlocking).toBe(true);
  });
});
