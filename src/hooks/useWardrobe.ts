import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WardrobeItem, Product } from '../types';
import { toast } from 'react-hot-toast';

export function useWardrobe(user: User | null) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWardrobe([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'wardrobe'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: WardrobeItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data() as WardrobeItem, docId: doc.id });
      });
      setWardrobe(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'wardrobe');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addToWardrobe = useCallback(async (product: Product, tryOnResult?: string) => {
    if (!user) {
      toast.error('Please sign in to save items');
      return;
    }

    try {
      await addDoc(collection(db, 'wardrobe'), {
        ...product,
        userId: user.uid,
        createdAt: serverTimestamp(),
        tryOnResult
      });
      toast.success('Added to wardrobe');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'wardrobe');
      toast.error('Failed to add to wardrobe');
    }
  }, [user]);

  const removeFromWardrobe = useCallback(async (docId: string) => {
    try {
      await deleteDoc(doc(db, 'wardrobe', docId));
      toast.success('Removed from wardrobe');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'wardrobe');
      toast.error('Failed to remove from wardrobe');
    }
  }, []);

  return { wardrobe, loading, addToWardrobe, removeFromWardrobe };
}
