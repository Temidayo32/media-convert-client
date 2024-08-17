import axios from 'axios';
import { Dispatch, SetStateAction } from 'react';

const BASE_URL = process.env.REACT_APP_BASE_URL

export async function emailVerification(
    email: string, 
    setErrorMessage: Dispatch<SetStateAction<string | null>>, 
    setSuccessMessage: Dispatch<SetStateAction<string | null>>
) {
    const formData = new FormData();
    formData.append('email', email);

    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }

    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
      };

      try {
        const response = await axios.post(`${BASE_URL}/email/sendEmail`, formData, { headers, withCredentials: true });
        setSuccessMessage(response.data.message || 'Verification email sent successfully');
        setErrorMessage(null); // Clear any previous error message
        return { success: true, data: response.data };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        console.log(error)
        setErrorMessage(errorMessage);
        setSuccessMessage(null); // Clear any previous success message
        return { success: false, error };
      }
}