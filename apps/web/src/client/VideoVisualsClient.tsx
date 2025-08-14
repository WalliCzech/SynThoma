'use client';
import { useEffect } from 'react';
import { initVideoVisuals } from '@web/lib/videoVisuals';

export default function VideoVisualsClient() {
  useEffect(() => {
    try { initVideoVisuals({ attachToWindow: true }); } catch {}
  }, []);
  return null;
}
