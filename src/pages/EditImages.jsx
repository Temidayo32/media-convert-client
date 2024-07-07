import React, {useState, useEffect} from 'react'
import { EditImage } from '../components';
import { useParams, useLocation } from 'react-router-dom';

function EditImages() {
  const { format } = useParams();
  const location = useLocation();
  const [key, setKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setKey((prevKey) => prevKey + 1);
  }, [format, location.pathname]);



  return (
    <div key={key} className='mt-16'>
       <EditImage defaultFormat={format}/>
    </div>
  )
}

export default EditImages;