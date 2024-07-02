import React, {useState, useEffect} from 'react';
import { ImOnedrive } from 'react-icons/im';
import { getAuthenticatedClient } from '../../deprecated/graphUtils';
import { Link } from 'react-router-dom';

const OneDrivePicker = ({ onSuccess }) => {
  const [msalInstance, setMsalInstance] = useState(null);

  useEffect(() => {
    const initializeMsalInstance = async () => {
      const { PublicClientApplication } = await import('@azure/msal-browser');

      const msalConfig = {
        auth: {
          clientId: 'your-client-id',
          redirectUri: 'http://localhost:3000',
        },
      };

      const instance = new PublicClientApplication(msalConfig);
      setMsalInstance(instance);
    };

    initializeMsalInstance();
  }, []);

  const handleFileSelectedFromOneDrive = async () => {
    if (!msalInstance) {
      console.error('MSAL instance not initialized');
      return;
    }

    const graphClient = await getAuthenticatedClient(msalInstance);

    if (!graphClient) {
      console.error('Error initializing Graph client');
      return;
    }

    try {
      const response = await graphClient.api('/me/drive/root/children')
        .filter("file ne null")
        .select("id,name,webUrl")
        .get();
      
      onSuccess(response.value);
    } catch (error) {
      console.error('Error retrieving files from OneDrive:', error);
    }
  };

  return (
    <Link
      className="p-4 pl-8 hover:bg-teal-600 flex items-center transition-colors duration-300"
      onClick={handleFileSelectedFromOneDrive}
    >
      <ImOnedrive className="text-2xl mr-4" />
      From OneDrive
    </Link>
  );
};

export default OneDrivePicker;
