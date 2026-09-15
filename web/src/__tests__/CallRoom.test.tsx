import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreJoinModal } from '../components/call/PreJoinModal';

describe('PreJoinModal Component', () => {
  it('should render camera and microphone verification options', () => {
    render(<PreJoinModal onJoin={vi.fn()} />);

    expect(screen.getByText('Verificacion Previa de Camara y Microfono')).toBeDefined();
    expect(screen.getByText('Microfono')).toBeDefined();
    expect(screen.getByText('Camara Web')).toBeDefined();
    expect(screen.getByText('Ingresar a la Consulta')).toBeDefined();
  });

  it('should call onJoin with selected audio and video states when user clicks join button', () => {
    const handleJoin = vi.fn();
    render(<PreJoinModal onJoin={handleJoin} />);

    const joinButton = screen.getByText('Ingresar a la Consulta');
    fireEvent.click(joinButton);

    expect(handleJoin).toHaveBeenCalledWith(true, true);
  });
});
