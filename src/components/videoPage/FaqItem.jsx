import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={toggleOpen}
      >
        <span className="text-sm md:text-lg font-semibold text-teal-800">{question}</span>
        <span className="text-teal-800 ">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      {isOpen && <p className="text-sm md:text-lg mt-4 text-gray-700">{answer}</p>}
    </div>
  );
};

export default FaqItem;
