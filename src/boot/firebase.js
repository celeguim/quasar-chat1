import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import Filter from "bad-words";
import { ref, onUnmounted, computed } from "vue";
//
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
} from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyDY7HVOvsFcLkwHhxRG88p69M13rKGNuTI",
  authDomain: "multi-lang-chat-project.firebaseapp.com",
  projectId: "multi-lang-chat-project",
  storageBucket: "multi-lang-chat-project.appspot.com",
  messagingSenderId: "131256732681",
  appId: "1:131256732681:web:21b421c7f0b8dc8c44bcd8",
};

const firebaseApp = initializeApp(firebaseConfig);
console.log("firebaseApp", firebaseApp);

const auth = getAuth(firebaseApp);
console.log("auth", auth);

const firestore = getFirestore(firebaseApp);
console.log("firestore", firestore);

const messagesCollection = collection(firestore, "messages");
const messagesQuery = orderBy("createdAt", "desc");
console.log("messagesQuery", messagesQuery);

async function getChats(firestore) {
  const chatsCol = collection(firestore, "chats");
  const chatSnapshot = await getDocs(chatsCol);
  const chatList = chatSnapshot.docs.map((doc) => doc.data());

  return chatList;
}

const chatList = getChats(firestore);

export function useAuth() {
  const user = ref(null);
  const unsubscribe = auth.onAuthStateChanged((_user) => (user.value = _user));
  onUnmounted(unsubscribe);
  const isLogin = computed(() => user.value !== null);

  const signIn = async () => {
    const googleProvider = new auth.GoogleAuthProvider();
    await auth.signInWithPopup(googleProvider);
  };
  const signOut = () => auth.signOut();

  return { user, isLogin, signIn, signOut };
}

export function useChat() {
  const messages = ref([]);
  const unsubscribe = messagesQuery.onSnapshot((snapshot) => {
    messages.value = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .reverse();
  });
  onUnmounted(unsubscribe);

  const { user, isLogin } = useAuth();
  const sendMessage = (text) => {
    if (!isLogin.value) return;
    const { photoURL, uid, displayName } = user.value;
    messagesCollection.add({
      userName: displayName,
      userId: uid,
      userPhotoURL: photoURL,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  };

  return { messages, sendMessage };
}
