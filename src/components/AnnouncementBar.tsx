import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AnnouncementBar() {
  const [active, setActive] = useState(false);
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [bg, setBg] = useState('#C8860A');
  const [color, setColor] = useState('#000000');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('announcementDismissed')) {
      setDismissed(true);
      return;
    }

    async function fetchAnnouncement() {
      const { data } = await supabase.from('settings').select('*').in('key', ['announcement_active', 'announcement_text', 'announcement_link', 'announcement_bg', 'announcement_color']);
      
      if (data) {
        const settings = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as any);
        if (settings.announcement_active === 'true') {
          setText(settings.announcement_text || '');
          setLink(settings.announcement_link || '');
          setBg(settings.announcement_bg || '#C8860A');
          setColor(settings.announcement_color || '#000000');
          setActive(true);
        }
      }
    }
    fetchAnnouncement();
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sessionStorage.setItem('announcementDismissed', 'true');
    setDismissed(true);
  };

  if (!active || dismissed || !text) return null;

  const content = (
    <div 
      className="w-full py-2 px-4 text-center font-bold text-sm relative z-50 shadow-md"
      style={{ backgroundColor: bg, color: color }}
    >
      {text}
      <button 
        onClick={handleDismiss} 
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 p-1"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-95 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
