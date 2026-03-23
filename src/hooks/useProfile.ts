import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { toast } from 'react-hot-toast';

const DEFAULT_PROFILE: UserProfile = {
  stylePreference: '',
  bodyType: '',
  height: '',
  weight: '',
  skinTone: '#F9E4D4'
};

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        ...newProfile,
        updatedAt: serverTimestamp()
      });
      setProfile(newProfile);
      toast.success('Profile updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'profiles');
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }, [user]);

  return { profile, loading, saving, saveProfile };
}
