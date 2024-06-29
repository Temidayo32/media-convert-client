// the utility functions are for uploading files
import { gapi } from 'gapi-script';
import { handleGoogleAuth } from './goggleAuth';
const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024;

function formatFileSize(bytes) {
    const mbSize = bytes / (1024 * 1024);
    if (mbSize < 1024) {
      return mbSize.toFixed(2) + ' MB';
    } else {
      const gbSize = mbSize / 1024;
      return gbSize.toFixed(2) + ' GB';
    }
  }

//upload for local device
export function handleFileUpload(e, defaultFormat, defaultSettings, uploadedFiles, setUploadedFiles, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm) {
    const files = e.target.files;
    const newFiles = [...uploadedFiles];
    const oversizedFiles = [];
  
    for (let i = 0; i < files.length; i++) {
      if (!emailVerified && files[i].size > MAX_FILE_SIZE) {
        oversizedFiles.push(`File size of ${files[i].name} exceeds the 1 GB limit.`);
        continue;
      }
  
      newFiles.push({
        source: 'local',
        file: files[i],
        name: files[i].name,
        size: formatFileSize(files[i].size),
        format: defaultFormat,
        jobId: `${Date.now()}_${files[i].name.split('.')[0]}`,
        settings: { ...defaultSettings },
      });
    }
  
    setUploadedFiles(newFiles);
    setOversizedFiles(oversizedFiles);
  
    if (oversizedFiles.length > 0) {
      setShowErrorMessages(true);
      setTimeout(() => {
        setShowErrorMessages(false);
      }, 5000); // 5 seconds timeout
    }
  
    setShowUploadForm(false);
}

//upload for dropbox
export function onSuccess(files, defaultFormat, defaultSettings, uploadedFiles, setUploadedFiles, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm) {
    const newFiles = [...uploadedFiles];
    const oversizedFiles = [];
  
    for (let i = 0; i < files.length; i++) {
      if (!emailVerified && files[i].bytes > MAX_FILE_SIZE) {
        oversizedFiles.push(`File size of ${files[i].name} exceeds the 1 GB limit.`);
        continue;
      }
  
      newFiles.push({
        source: 'dropbox',
        file: files[i],
        name: files[i].name,
        fileLink: files[i].link,
        size: formatFileSize(files[i].bytes),
        format: defaultFormat,
        jobId: `${Date.now()}_${files[i].name.split('.')[0]}`,
        settings: { ...defaultSettings },
      });
    }
  
    console.log(files);
    setUploadedFiles(newFiles);
    setOversizedFiles(oversizedFiles);
  
    if (oversizedFiles.length > 0) {
      setShowErrorMessages(true);
      setTimeout(() => {
        setShowErrorMessages(false);
      }, 5000); // 5 seconds timeout
    }
  
    setShowUploadForm(false);
  }


  //function for upload from Google Drive
export async function handleOpenPicker(developerKey, uploadedFiles, setUploadedFiles, defaultFormat, defaultSettings, emailVerified, setOversizedFiles, setShowErrorMessages, setShowUploadForm, mimeTypePrefix) {
    const accessToken = await handleGoogleAuth();
    console.log(accessToken);
  
    gapi.load('picker', {
      callback: () => {
        try {
          const picker = new window.google.picker.PickerBuilder()
            .setOrigin("https://localhost:3000")
            .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
            .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
            .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
            .setOAuthToken(accessToken)
            .setDeveloperKey(developerKey)
            .addView(new window.google.picker.DocsUploadView())
            .setCallback((data) => {
              if (data.action === window.google.picker.Action.CANCEL) {
                console.log('User clicked cancel/close button');
              } else if (data.docs) {
                const selectedFiles = data.docs.filter(doc => doc.mimeType.startsWith(mimeTypePrefix));
                const newFiles = [...uploadedFiles];
                const oversizedFiles = [];
  
                for (let i = 0; i < selectedFiles.length; i++) {
                  if (!emailVerified && selectedFiles[i].sizeBytes > MAX_FILE_SIZE) {
                    oversizedFiles.push(`File size of ${selectedFiles[i].name} exceeds the 1 GB limit.`);
                    continue;
                  }
  
                  newFiles.push({
                    source: 'google',
                    file: selectedFiles[i],
                    fileId: selectedFiles[i].id,
                    name: selectedFiles[i].name,
                    size: formatFileSize(selectedFiles[i].sizeBytes),
                    format: defaultFormat,
                    jobId: `${Date.now()}_${selectedFiles[i].name.split('.')[0]}`,
                    settings: { ...defaultSettings },
                  });
                }
  
                setUploadedFiles(newFiles);
                setOversizedFiles(oversizedFiles);
  
                if (oversizedFiles.length > 0) {
                  setShowErrorMessages(true);
                  setTimeout(() => {
                    setShowErrorMessages(false);
                  }, 5000); // 5 seconds timeout
                }
  
                setShowUploadForm(false);
              }
            })
            .build();
  
          picker.setVisible(true);
        } catch (error) {
          console.error('Error occurred during Google Picker operation:', error);
        }
      },
      onerror: (error) => {
        console.error('Error loading Google Picker API:', error);
      }
    });
  }

//function return when cancel button is clicked.
export function onCancel() {
    console.log('Cancelled');
  }
  
