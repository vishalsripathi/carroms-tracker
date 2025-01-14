import { useState } from 'react';
import { auth } from '../../services/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const TestFirebase = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to sign in');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Firebase Test</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {user ? (
        <div className="bg-green-100 p-3 rounded">
          <p>Signed in as: {user.email}</p>
          <button 
            onClick={() => auth.signOut()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
};