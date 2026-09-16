describe('Mobile Prescription Data Formatters', () => {
  it('should format prescription share text with medication and vet license', () => {
    const rx = {
      medication: 'Amoxicilina 250mg',
      dosage: '1 comprimido',
      licenseNumber: 'MP-8921',
    };

    const text = `Receta Médica Digital VetConnect SENASA\nMedicamento: ${rx.medication}\nDosis: ${rx.dosage}\nMatrícula Vet: ${rx.licenseNumber}`;

    expect(text).toContain('Amoxicilina 250mg');
    expect(text).toContain('MP-8921');
    expect(text).toContain('SENASA');
  });
});
