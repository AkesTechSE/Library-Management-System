import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  UserCredential
} from "firebase/auth"
import { getFirebaseConfigErrorMessage, tryGetFirebaseAuth } from "./config"

export const loginWithEmail = (email: string, password: string): Promise<UserCredential> => {
  const auth = tryGetFirebaseAuth()
  if (!auth) return Promise.reject(new Error(getFirebaseConfigErrorMessage()))
  return signInWithEmailAndPassword(auth, email, password)
}

export const registerWithEmail = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<UserCredential> => {
  const auth = tryGetFirebaseAuth()
  if (!auth) throw new Error(getFirebaseConfigErrorMessage())

  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName })
  return userCredential
}

export const loginWithGoogle = (): Promise<UserCredential> => {
  const auth = tryGetFirebaseAuth()
  if (!auth) return Promise.reject(new Error(getFirebaseConfigErrorMessage()))
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export const logout = (): Promise<void> => {
  const auth = tryGetFirebaseAuth()
  if (!auth) return Promise.resolve()
  return signOut(auth)
}