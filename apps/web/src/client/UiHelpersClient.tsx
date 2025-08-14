'use client';
import { useEffect } from 'react';
import { initUiHelpers } from '@web/lib/uiHelpers';

export default function UiHelpersClient() {
  useEffect(() => {
    try { initUiHelpers({ attachToWindow: true }); } catch {}
  }, []);
  return null;
}
