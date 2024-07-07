import { useRef } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const ImageThumbnails = ({ uploadedImages, selectedImageId, setSelectedImageId }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollContainerRef;
    if (direction === 'left') {
      current.scrollBy({ left: -current.clientWidth, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-4 h-48 w-2/5 mx-auto flex items-center justify-center relative">
      {uploadedImages.length > 0 && (
        <button
          className="absolute left-0 z-10 p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300"
          onClick={() => scroll('left')}
        >
          <MdChevronLeft size={24} />
        </button>
      )}
      <div
        ref={scrollContainerRef}
        className="w-full h-full flex items-center justify-center overflow-x-auto space-x-4 hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {uploadedImages.map(img => (
          <div
            key={img.jobId}
            className={`flex-shrink-0 w-24 p-2 border transition-transform duration-300 ${selectedImageId === img.jobId ? 'border-teal-500 transform scale-105' : 'border-gray-300 opacity-50'}`}
            onClick={() => setSelectedImageId(img.jobId)}
          >
            <img
              src={img.source === 'local' ? URL.createObjectURL(img.file) : img.fileLink.replace('dl=0', 'raw=1')}
              alt={img.name}
              className="h-16 cursor-pointer"
            />
          </div>
        ))}
      </div>
      {uploadedImages.length > 0 && (
        <button
          className="absolute right-0 z-10 p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300"
          onClick={() => scroll('right')}
        >
          <MdChevronRight size={24} />
        </button>
      )}
    </div>
  );
};

export default ImageThumbnails;
