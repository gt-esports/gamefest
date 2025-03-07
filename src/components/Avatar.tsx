import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  link: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Sponsor logo", link="/", className }) => {
  return (
    
      <div className={`flex items-center justify-center w-32 h-32 rounded-full overflow-hidden mx-auto mb-10 bg-[#d9d9d9] cursor-pointer ${className || ''}`}>
        
        {src ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
          <img src={src} alt={alt} className="w-full h-full object-cover" />
          </a>
        ) : (
          <a href={link} target="_blank" rel="noopener noreferrer">
          <span className="text-center font-medium">{alt}</span>
          </a>
        )}
        
      </div>
  );
};

export default Avatar;

