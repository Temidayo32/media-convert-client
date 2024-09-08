import React from 'react';
import FaqItem  from './FaqItem';
 
const FaqSection = () => {
    const faqs = [
      {
        question: 'What types of files can I convert using Convert Quickly?',
        answer: 'Convert Quickly supports a wide range of file conversions including videos, images, and documents. Currently, it accommodates up to 16 video formats, ensuring seamless conversion from one format to another without compromising quality.',
      },
      {
        question: 'Does Convert Quickly support batch conversion?',
        answer: 'Absolutely! Convert Quickly allows batch conversions, enabling you to upload and convert multiple files simultaneously. Non-registered users can convert up to 5 files daily. Sign up to unlock unlimited conversions!',
      },
      {
        question: 'Does Convert Quickly support large file conversions?',
        answer: 'Yes, Convert Quickly handles large file conversions efficiently. Non-registered users can convert files up to 1GB. Register to lift this restriction and convert larger video files with ease!',
      },
    ];
  
    return (
      <section className="bg-white pt-8 py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-teal-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default FaqSection;