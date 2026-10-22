import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  deleteUser,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Task } from '../types';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Deep clean object to remove undefined values before sending to Firestore
export function sanitizeForFirestore<T>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  if (!data || typeof data !== 'object') return clean;

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      clean[key] = value.map((item) => {
        if (item && typeof item === 'object') {
          const cleanItem: Record<string, any> = {};
          for (const [k, v] of Object.entries(item)) {
            if (v !== undefined) {
              cleanItem[k] = v;
            }
          }
          return cleanItem;
        }
        return item;
      });
    } else if (value && typeof value === 'object' && !(value instanceof Date)) {
      clean[key] = sanitizeForFirestore(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// Initial connection test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice: client seems offline.');
      return false;
    }
    return true;
  }
}

// Google Auth Sign-in
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

// Sign-out
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out error:', err);
    throw err;
  }
}

// Delete user account & all associated tasks
export async function deleteUserAccountAndData(userId: string): Promise<void> {
  const tasksPath = `users/${userId}/tasks`;
  try {
    const snap = await getDocs(collection(db, tasksPath));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();

    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, tasksPath);
  }
}

// Real-time subscribe to user's tasks
export function subscribeToUserTasks(
  userId: string,
  onTasks: (tasks: Task[]) => void,
  onError: (err: Error) => void
): () => void {
  const tasksPath = `users/${userId}/tasks`;
  const tasksCol = collection(db, tasksPath);

  return onSnapshot(
    tasksCol,
    (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Task;
        // Filter out any remnant demo tasks if present
        if (
          !docSnap.id.startsWith('task_demo_') &&
          !docSnap.id.startsWith('task_init_') &&
          !data.title?.includes('derivácie') &&
          !data.title?.includes('fotosyntéze')
        ) {
          items.push({
            ...data,
            id: docSnap.id,
          });
        }
      });
      // Sort by createdAt descending
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onTasks(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, tasksPath);
      onError(error);
    }
  );
}

// Add or update task in Firestore
export async function saveTaskToFirestore(userId: string, task: Task): Promise<void> {
  const docPath = `users/${userId}/tasks/${task.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'tasks', task.id);
    const sanitized = sanitizeForFirestore({
      ...task,
      userId,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

// Delete task from Firestore
export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  const docPath = `users/${userId}/tasks/${taskId}`;
  try {
    const docRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}
