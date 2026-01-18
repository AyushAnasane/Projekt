module.exports = {
  content: ["./popup.html", "./*.js"],  
  theme: {
    extend: {
      colors: {
        'gray': {
          850: '#1f2937',
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      },
      spacing: {
        '15': '3.75rem',  
        '7.5': '1.875rem',
      },
      width: {
        '15': '3.75rem',
        '7.5': '1.875rem',
      },
      height: {
        '15': '3.75rem',
        '7.5': '1.875rem',
      },
      scale: {
        '98': '0.98',
      },
      padding: {
        '25': '6.25rem',
      },
      fontFamily: {
        'mono': ['Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}