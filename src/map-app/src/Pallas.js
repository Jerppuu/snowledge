/**
Pää javascript react appiin

Luonut: Markku Nirkkonen

Päivityshistoria

29.12.2020 Lisätty kirjautuneen käyttäjän tietojen tallentamiseen liittyviä toimintoja

11.12. Lisättiin lumilaadun ja alasegmentin tiedot hakujen parsimiseen

Markku Nirkkonen 26.11.2020
Hallintanäkymän komponentti lisätty

Arttu Lakkala 15.11 Lisätty päivityksen lisäys segmenttiin.

**/

import * as React from "react";
import { useEffect } from 'react';
import './App.css';
import './style.css';
import Map from './NewMap';
import Manage from './Manage';
import Info from './Info';
import TopBar from './TopBar';
import { useMediaQuery } from 'react-responsive';
//import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//   toolbar: theme.mixins.toolbar,
// }));

function App() {

  // Use state hookit
  const [token, setToken] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [segments, setSegments] = React.useState([]);
  const [segmentColors, setSegmentColors] = React.useState(null);
  const [shownSegment, setShownSegment] = React.useState(null);
  const [viewManagement, setViewManagement] = React.useState(false);

  //imported hook. Kysely näyttöportin koosta
  const isMobile = useMediaQuery({query: '(max-width:760px)'});
  
  // Valikoissa näkyvä teksti riippuu näytettävästä tilasta
  const manageOrMap = (viewManagement ? "Kartta" : "Hallitse");

  // const styledClasses = useStyles();

  /*
   * Haetaan renderöinnin jälkeen aina tiedot lumilaaduista, päivityksistä ja segmenteistä
   * Tallennetaan ne hookkeihin
   *
   */
  useEffect(() => {
    const fetchData = async () => {
      const snow = await fetch('api/lumilaadut');
      const snowdata = await snow.json();
      const updates = await fetch('api/segments/update');
      const updateData = await updates.json();
      const response = await fetch('api/segments');
      const data = await response.json();

      // Taulukko käytettäville väreille kartassa. Musta väri oletuksena, jos tietoa ei ole
      // Muut värit suoraan kannasta
      const emptyColor = [{color: "#000000", name: "Ei tietoa"}];
      const snowcolors = snowdata.map((item) => {
        return {color: item.Vari, name: item.Nimi};
      });
      setSegmentColors(emptyColor.concat(snowcolors));
      
      await updateData.forEach(update => {
        snowdata.forEach(snow => {
          if(snow.ID === update.Lumilaatu){
            update.Lumi = snow;
          }
        });
      });
      
      data.forEach(segment => {
        segment.update = null;
        updateData.forEach(update => {
          if (update.Segmentti === segment.ID) {
            segment.update = update;
          }
        });
        if(segment.On_Alasegmentti != null)
        {
          data.forEach(mahd_yla_segmentti => {
            if(mahd_yla_segmentti.ID === segment.On_Alasegmentti){
              segment.On_Alasegmentti = mahd_yla_segmentti.Nimi;
            }
          });
        }
      });
      console.log(data);
      updateSegments(data);
    };
    fetchData();
  }, []);

  /*
   * Event handlerit
   */

  // Segmentin valinta
   function chooseSegment(choice) {
    setShownSegment(choice);
  }

  // Token tallennetaan reactin stateen
  function updateToken(token) {
    setToken(token);
  }

  // Käyttäjän päivitys (kirjautuneen)
  function updateUser(user) {
    setUser(user);
  }

  // Kaikkien segmenttien päivittäminen
  function updateSegments(data) {
    setSegments(data);
  }

  // Vaihtaa näkymää hallinnan ja kartan välillä
  function updateView() {
    setViewManagement(!viewManagement);
  }

  // TODO: Komponenttien tyylejä ja asetteluja voi vielä parannella
  return (
    <div className="app">
        {/* Sovelluksen yläpalkki */}
        <div className="top_bar">
          <TopBar 
            isMobile={isMobile} 
            updateUser={updateUser}
            user={user}
            token={token} 
            updateToken={updateToken} 
            updateView={updateView}
            viewManagement={viewManagement} 
            manageOrMap={manageOrMap} 
          />   
        </div>
        <div className="map_container">
          {/* Hallintanäkymä tai kartta tilanteen mukaan */}
            {
              (
                viewManagement 
                ?
                <Manage 
                  segments={segments}
                  role={user.Rooli}
                  token={token}
                  onUpdate={chooseSegment}
                  updateSegments={updateSegments}
                  shownSegment={shownSegment}
                />
                :
                <Map 
                  shownSegment={shownSegment}
                  segmentColors={segmentColors}
                  segments={segments} 
                  onClick={chooseSegment} 
                  isMobile={isMobile} 
                />
              )
            }
        </div>
        {/* <div className="guide"></div> */}
        
        {/* Sovelluksen sivupalkki, jossa näytetään kartalta valitun segmentin tietoja
          Näytetään, kun jokin segmentti valittuna, eikä olla hallintanäkymässä */}
        <div className="segment_info">
          {(shownSegment !== null && !viewManagement ? 
            <Info
              //segments={segments}
              segmentdata={shownSegment} 
              token={token}
              updateSegments={updateSegments}
              onUpdate={chooseSegment}
              onClose={chooseSegment}
            />
            :
            <div />
          )} 
        </div>
    </div>
  );
}

export default App;