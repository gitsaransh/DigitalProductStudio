import React from 'react';

export default function TestimonialCard({ testimonial }) {
  const isImage = testimonial.avatar && (testimonial.avatar.startsWith('http') || testimonial.avatar.startsWith('/'));
  return (
    <div className="glass testimonial-card">
      <div className="testimonial-stars">{'★'.repeat(testimonial.stars)}</div>
      <p className="testimonial-text">"{testimonial.text}"</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar" style={{ overflow: 'hidden', padding: 0 }}>
          {isImage ? (
            <img 
              src={testimonial.avatar} 
              alt={testimonial.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            testimonial.avatar
          )}
        </div>
        <div>
          <div className="testimonial-name">{testimonial.name}</div>
          <div className="testimonial-role">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

