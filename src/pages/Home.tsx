import { 
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItemSliding,
  IonItem,
  IonLabel,
  IonText,
  IonItemOptions,
  IonItemOption,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/react';
import { add } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import './Home.css';
import SimpleModal from '../components/SimpleModal';
import { db } from '../firebase';

const Home: React.FC = () => {
  const [itemsArray, setItemsArray] : any = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [itemToEdit, setItemToEdit] = useState({});
  
  useEffect(() => {
    db.collection('items').get().then((snapshot) => {
      let tmpList: any = [];
      snapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.data()}`);
          tmpList.push({
            id: doc.id,
            description: doc.data().description
          });
      });
      setItemsArray(tmpList);
    });
  }, []);

  const addToList = (item: any) => {

    const tmpList = [...itemsArray];

    db.collection('items').add(item)
    .then(function(docRef) {
      item.id = docRef.id;

      tmpList.push(item);
      setItemsArray(tmpList);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  };

  const editFromList = (item: any) => {
    
    const tmpList = [...itemsArray];

    const itemIndex = itemsArray.findIndex((elem: any) => (elem.id === item.id));
    db.collection('items').doc(`${item.id}`).update(item)
    .then(
      () => {
        tmpList[itemIndex] = {...item};

        setItemsArray(tmpList);
        setItemToEdit({});
        setIsEditing(false);

        handleClose();
      }
    );
  };

  const getItemToEdit = (id: any) => {
    
    const itemIndex = itemsArray.findIndex((elem: any) => (elem.id === id));
    const tmpItem = {...itemsArray[itemIndex]};

    setItemToEdit(tmpItem);
    setIsEditing(true);

    handleOpen();
  };

  const removeFromList = (key: any) => {
 
    const tmpList = [...itemsArray];

    const itemIndex = itemsArray.findIndex((item: any) => (item.id === key));

    db.collection('items').doc(`${key}`).delete().then(function() {
      tmpList.splice(itemIndex,1);
      setItemsArray(tmpList);
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  };

  const [openModal, setOpenModal] = useState(false);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ionic-react firestore</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">ionic-react firestore</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
        {itemsArray.map( (item: any) => { 
          return ( 
          <IonItemSliding key={item.id}>
            <IonItem>
              <IonLabel>
              <IonText color="primary">
                <h3>{item.description}</h3>
              </IonText>
              </IonLabel>
            </IonItem>
            <IonItemOptions side="end">
            <IonItemOption onClick={() => {getItemToEdit(item.id)}}>Edit</IonItemOption>
            <IonItemOption onClick={() => {removeFromList(item.id)}} color="secondary">Delete</IonItemOption>     
            </IonItemOptions>
          </IonItemSliding>
          ); 
        })}
        </IonList>
        <SimpleModal 
        addToList={addToList}
        editFromList={editFromList}
        toggleModal={setOpenModal}
        isOpen={openModal}
        handleClose={handleClose}
        isEditing={isEditing}
        itemToEdit={itemToEdit}
        />
        <IonFab onClick={() => handleOpen()} vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
