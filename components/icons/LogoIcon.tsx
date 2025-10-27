import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="currentColor"
        aria-hidden="true"
    >
        {/* Rooster Body & Head */}
        <path d="M52,28 C45,20 40,22 35,30 C30,38 28,48 32,58 C35,65 42,75 50,78 C58,75 65,65 68,58 C72,48 70,38 65,30 C60,22 55,20 52,28 Z" fill="#8B542F"/>
        
        {/* Comb */}
        <path d="M52,28 C50,22 48,20 45,21 C42,22 43,26 45,28 C47,30 49,29 52,28 Z" fill="#C0392B"/>
        <path d="M45,21 C42,18 40,18 38,20 C36,22 37,25 39,27 C41,29 43,28 45,26 Z" fill="#C0392B"/>
        <path d="M55,25 C58,22 60,22 62,24 C64,26 63,29 61,31 C59,33 57,32 55,30 Z" fill="#C0392B"/>
        
        {/* Beak */}
        <path d="M35,30 C32,28 30,30 32,33 C34,36 37,35 35,30 Z" fill="#F39C12"/>
        
        {/* Wattle */}
        <path d="M42,38 C40,42 41,45 44,45 C47,45 46,42 44,38 Z" fill="#E74C3C"/>
        
        {/* Eye */}
        <circle cx="42" cy="32" r="2" fill="black"/>
        
        {/* Wing/Hand holding scales */}
        <path d="M55,55 C50,65 52,70 60,68 C65,66 68,60 65,55 L70,50" fill="#A0522D"/>

        {/* Scales of Justice */}
        <g stroke="#F9A825" strokeWidth="2.5" fill="none" strokeLinecap="round">
            {/* Vertical Bar */}
            <path d="M70,50 L70,35"/>
            {/* Horizontal Bar */}
            <path d="M60,40 L80,40"/>
            
            {/* Left Pan */}
            <path d="M60,40 L58,45"/>
            <path d="M60,40 L62,45"/>
            <path d="M55,48 C58,52 65,52 68,48" strokeWidth="2"/>

            {/* Right Pan */}
            <path d="M80,40 L78,45"/>
            <path d="M80,40 L82,45"/>
            <path d="M75,48 C78,52 85,52 88,48" strokeWidth="2"/>
        </g>
    </svg>
);