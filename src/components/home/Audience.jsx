import React from 'react';
import AudienceCard from './AudienceCard';

const cardsData = [
  {
    backgroundImage:'/influencer.jpg', 
    title: 'Content Creators and Social Media Influencers',
    description: "Whether you're a YouTuber, vlogger, or social media influencer, our tool ensures your videos are always in the right format and size suitable for your specific platforms."
  },
  {
    backgroundImage: '/freelancers.jpg',
    title: 'Freelancers and Small Business Owners',
    description: 'Our easy-to-use tool supports multiple formats, helping you prepare content for clients or online distribution without breaking the bank.'
  },
  {
    backgroundImage: '/marketers.jpg',
    title: 'Marketers and Sales',
    description: "Our powerful conversion tool supports multiple formats and batch processing, saving you time and ensuring your videos are perfect for every platform. Whether it's for social media, email campaigns, or your website, Media Convert helps you deliver high-quality video content that drives engagement."
  },
  {
    backgroundImage: '/student.jpg',
    title: 'Students and Educators',
    description: 'Standardize your educational videos for any LMS and device. With Media Convert, you can ensure high-quality, accessible content that enhances the learning experience for students everywhere.'
  },
  {
    backgroundImage: '/mediaent.jpg',
    title: 'Media and Entertainment Industry',
    description: 'Handle large files and industry-standard formats with ease, ensuring your videos are ready for editing, distribution, and archiving. Our high-capacity tool maintains quality while supporting batch conversions, saving you time and effort.'
  },
  {
    backgroundImage: '/corporate.jpg',
    title: 'Corporate and Business Users',
    description: 'From training videos to marketing content, ensure your videos are in the correct format for every device and platform. Our tool offers secure and efficient conversions with batch processing capabilities, ideal for corporate needs.'
  }
];

const Audience = () => {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-8 text-center">Who Benefits from Media Convert?</h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {cardsData.map((card, index) => (
              <AudienceCard key={index} backgroundImage={card.backgroundImage} title={card.title} description={card.description} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Audience;
