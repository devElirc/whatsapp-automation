import React, { useEffect, useRef } from 'react';

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Initial canvas size
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const stars = Array.from({ length: 500 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.5,
    }));

    const draw = () => {
      // Update canvas size on each frame to match window
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, width, height);

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0b0f23');
      gradient.addColorStop(1, '#1a1c2c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      stars.forEach(star => {
        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.1;
        star.opacity = Math.max(0.3, Math.min(1, star.opacity));

        // Draw star with glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 255, 200, 0.8)';
        ctx.fillStyle = `rgba(255, 255, 160, ${star.opacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Move star and wrap around edges
        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;
      });

      requestAnimationFrame(draw);
    };

    draw();

    // Handle window resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Reposition stars within new bounds
      stars.forEach(star => {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', // Changed from 'absolute' to ensure full window coverage
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100vw', // Use viewport width
        height: '100vh', // Use viewport height
        background: 'transparent', // Remove background to rely on gradient
      }}
    />
  );
};

export default Starfield;