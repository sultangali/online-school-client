// components/LessonTheoryView.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';

import remarkMath from 'remark-math'; // Для поддержки математических формул
import rehypeKatex from 'rehype-katex'; // Для рендеринга формул с помощью KaTeX
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css'; // Стили для KaTeX

export const LessonTheoryView = ({ theory }) => {
  return (
    <div>
      <h3>Теория</h3>
      <ReactMarkdown
        children={theory}
        remarkPlugins={[ remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      />
    </div>
  );
};

LessonTheoryView.propTypes = {
  theory: PropTypes.string.isRequired,
};

