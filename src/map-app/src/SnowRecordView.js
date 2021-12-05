/**

Component for showing snow record information for segment

Luonut: Markku Nirkkonen

Päivityshistoria

5.12.2021 Juho Kumara
Snow type names, icons and skiiability values are now shown correctly.

7.11.2021 Oona Laitamaki
Updated layout design

23.10.2021 Oona Laitamaki
Changed layout design & added relative timestamp, skiability elements and sub snowtypes

18.10.2021
Moved here from Info.js

**/


import * as React from "react";
import { useMediaQuery } from "react-responsive";
import { makeStyles } from "@material-ui/core/styles";
import CardMedia from "@material-ui/core/CardMedia";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import InputBase from "@material-ui/core/InputBase";
// eslint-disable-next-line no-unused-vars
import { getThemeProps } from "@material-ui/styles";


const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  addPadding: {
    padding: "15px",
  },
  close: {
    color: "white",
    left: "85%",
  },
  divider: {
    height: "1px",
    background: "#707070",
    margin: 5,
  },
  snowInfo: {
    alignContent: "center",
  },
  bigHeaders: {
    fontFamily: "Donau",
    letterSpacing: 4,
    textTransform: "uppercase",
    fontWeight: 600,
    display: "block",
    color: "white",
  },
  smallHeaders: {
    fontFamily: "Donau",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: 600,
    display: "block",
    fontSize: "medium",
  },
  normalText: {
    fontFamily: "Donau",
    letterSpacing: 2,
    fontWeight: 300,
    fontSize: "medium",
  },
  dangerIcon: {
    verticalAlign: "middle",
    maxWidth: "8%",
  },
  skiabilityIcon: {
    height: "16px",
    width: "90px",
    display: "block",
  },
  expandOpen: {
    transform: "rotate(-180deg)"
  },
  expandClosed: {
    transform: "rotate(0)"
  }
}));

function getRelativeTimestamp(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (Math.round(elapsed / 1000) == 1) {
      return "1 sekunti sitten";
    }
    return `${Math.round(elapsed / 1000)} sekuntia sitten`;
  } else if (elapsed < msPerHour) {
    if (Math.round(elapsed / msPerMinute) == 1) {
      return "1 minuutti sitten";
    }
    return `${Math.round(elapsed / msPerMinute)} minuuttia sitten`;
  } else if (elapsed < msPerDay) {
    if (Math.round(elapsed / msPerHour) == 1) {
      return "1 tunti sitten";
    }
    return `${Math.round(elapsed / msPerHour)} tuntia sitten`;
  } else if (elapsed < msPerMonth) {
    if (Math.round(elapsed / msPerDay) == 1) {
      return "1 päivä sitten";
    }
    return `noin ${Math.round(elapsed / msPerDay)} päivää sitten`;
  } else if (elapsed < msPerYear) {
    if (Math.round(elapsed / msPerMonth) == 1) {
      return "1 kuukausi sitten";
    }
    return `noin ${Math.round(elapsed / msPerMonth)} kuukautta sitten`;
  } else {
    if (Math.round(elapsed / msPerYear) == 1) {
      return "1 vuosi sitten";
    }
    return `noin ${Math.round(elapsed / msPerYear)} vuotta sitten`;
  }
}

function SnowRecordView({ segmentdata, close }) {
  const classes = useStyles();

  // 0px  XS  600px  SM  900px  MD
  const isXS = useMediaQuery({ query: "(max-width: 599px)" });
  //const isSM = useMediaQuery({ query: "(min-width: 600px) and (max-width: 900px)" });
  // eslint-disable-next-line no-unused-vars
  const [expanded, setExpanded] = React.useState(isXS ? false : true);

  const description = (segmentdata.update === null || segmentdata.update === undefined ? "" : segmentdata.update.Kuvaus);

  // Gets boolean value of snowtype visibility, by given index (indices 1&2 are primary types, 3&4 are secondary types)
  const isEnabled = (index) => {
    if (segmentdata.update !== null && segmentdata.update !== undefined) {
      let returnvalue = false;

      switch (index) {
      case 1:
        if (segmentdata.update.Lumi1 !== undefined) {
          returnvalue = true;
        }
        else {
          returnvalue = false;
        }
        break;
      case 2:
        if (segmentdata.update.Lumi2 !== undefined) {
          returnvalue = true;
        }
        else {
          returnvalue = false;
        }
        break;
      case 3:
        if (segmentdata.update.Lumi3 !== undefined) {
          returnvalue = true;
        }
        else {
          returnvalue = false;
        }
        break;
      case 4:
        if (segmentdata.update.Lumi4 !== undefined) {
          returnvalue = true;
        }
        else {
          returnvalue = false;
        }
        break;
      default:
        break;
      }

      return returnvalue;
    }
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  var updateInfo = "";

  // Parsitaan päivämäärä ja aika päivityksestä, mikäli päivitys löytyy
  if (segmentdata.update !== null && segmentdata.update !== undefined) {
    // Datasta saadaan viimeisin päivitysaika
    let latestUpdateTime = new Date(segmentdata.update.Aika);
    let currentTime = new Date();
    updateInfo = `Viimeksi päivitetty: ${getRelativeTimestamp(currentTime, latestUpdateTime)}`;
  }

  var dangerimage;
  var dangertext;

  // Alustetaan komponentit, mikäli valitulla segmentillä on lumivyöryvaara
  if (segmentdata !== null) {
    if (segmentdata.Lumivyöryvaara) {
      // Lumivyöryvaaran merkin tiedostonimi on !.png
      dangerimage = <img className={classes.dangerIcon} src={process.env.PUBLIC_URL + "/icons/avalanche.svg"} alt="lumivyöryvaaran logo" />;
      dangertext = <Typography className={classes.normalText} variant="subtitle1" color="error" display="inline">Lumivyöryherkkä alue, tarkista lumivyörytilanne!</Typography>;
    } else {
      dangerimage = <div />;
      dangertext = null;
    }
  }

  return (
    <Grid container className={classes.root}>

      <Grid container item xs={12} sm={12} style={{ backgroundColor: "#000000B3", margin: 0, paddingBottom: "1%" }}>
        {/* Button for closing snow record view */}
        <Grid item xs={12} sm={12}>
          <IconButton aria-label="close" style={isXS ? { color: "white", left: "85%" } : { color: "white", left: "92%", paddingTop: "1%", paddingBottom: 0 }} onClick={() => close()}>
            <CloseIcon />
          </IconButton>
        </Grid>

        {/* Segment name */}
        <Grid item xs={12} sm={12}>
          <Typography className={classes.bigHeaders} variant="h5" align="center" component="p">
            {segmentdata === null ? "Ei nimitietoa" : segmentdata.Nimi}
          </Typography>
        </Grid>
      </Grid>

      {/* Avalanche warning and icon if needed */}
      <Grid item xs={12} sm={12} align="center">
        {segmentdata === null ? null : dangertext}
        {segmentdata === null ? null : dangerimage}
      </Grid>

      {/* Description of segment, this might be changed later */}
      {!isXS && <Grid item xs={12} sm={12} align="center">
        {description !== "" && <InputBase
          className={classes.normalText}
          value={description}
          fullWidth={true}
          multiline
          maxRows={6}
        />
          /*<Typography className={classes.normalText} variant="subtitle1">
            {segmentdata.update === null || segmentdata.update === undefined ? "Ei kuvausta" : segmentdata.update.Teksti}
            {description}
          </Typography>*/
        }
      </Grid>}

      {/* Pohjamaasto, kommentoi näkyviin jos halutaan näyttää */}
      {/* <Typography variant="subtitle1" align="center" component="p">
          {segmentdata === null ? "Ei tietoa pohjamaastosta" : segmentdata.Maasto}
      </Typography> */}

      <Grid item xs={12} sm={12} container className={classes.addPadding}>

        {/* Main snowtype info */}
        {isEnabled(1) &&
          <Grid item xs={12} sm={5} container className={classes.snowInfo}>
            <Grid item xs={4} sm={3}>
              {/* Segmentin logon tulee olla nimetty segmentin ID:n kanssa yhtenevästi */}
              {/*segmentdata.update === null || segmentdata.update === undefined ? <div /> :*/
                <CardMedia
                  component={"img"}
                  src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + segmentdata.update.Lumilaatu_ID1 + ".svg"}
                  alt="lumityypin logo"
                />
              }
            </Grid>
            <Grid item container xs={8} sm={9} className={classes.snowInfo}>
              <Grid item xs={12} sm={12}>
                <Typography className={classes.smallHeaders} variant="body1" component="p">
                  {/*segmentdata.update === null || segmentdata.update === undefined ? "Ei tietoa" : segmentdata.update.Lumi.Nimi*/}
                  {segmentdata.update.Lumi1.Nimi}
                </Typography>
              </Grid>
              {segmentdata.update.Lumi1.Hiihdettavyys !== null &&
              <Grid item xs={12} sm={12}>
                <Typography xs={12} sm={12} className={classes.normalText} variant="body2" component="p">
                  Hiihdettävyys
                  <img className={classes.skiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + segmentdata.update.Lumi1.Hiihdettavyys + ".svg"} alt="skiability" />
                </Typography>
              </Grid>}
            </Grid>
          </Grid>}
        
        {/* Main snowtype info 2 */}
        {isEnabled(2) &&
          <Grid item xs={12} sm={5} container className={classes.snowInfo}>
            <Grid item xs={4} sm={3}>
              {/* Segmentin logon tulee olla nimetty segmentin ID:n kanssa yhtenevästi */}
              <CardMedia
                component={"img"}
                src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + segmentdata.update.Lumilaatu_ID2 + ".svg"}
                alt="lumityypin logo"
              />
            </Grid>
            <Grid item container xs={8} sm={9} className={classes.snowInfo}>
              <Grid item xs={12} sm={12}>
                <Typography className={classes.smallHeaders} variant="body1" component="p">
                  {segmentdata.update.Lumi2.Nimi}
                </Typography>
              </Grid>
              {segmentdata.update.Lumi2.Hiihdettavyys !== null &&
              <Grid item xs={12} sm={12}>
                <Typography xs={12} sm={12} className={classes.normalText} variant="body2" component="p">
                  Hiihdettävyys
                  <img className={classes.skiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + segmentdata.update.Lumi2.Hiihdettavyys + ".svg"} alt="skiability" />
                </Typography>
              </Grid>}
            </Grid>
          </Grid>}

        {/* Info about latest update time */}
        {isXS &&
          <Grid item xs={12} sm={12} container>
            <Grid item xs={12} sm={5}>
              <Typography className={classes.normalText} align="left" variant="body2" component="p">
                {segmentdata.update === null || segmentdata.update === undefined ? "" : updateInfo}
              </Typography>
            </Grid>
          </Grid >
        }
        {(isEnabled(3) || isEnabled(4) || description !== "") &&
        <Grid item xs={12} sm={7}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>

            {isXS &&
              <Grid item xs={12}>
                {description !== "" &&
                  <Divider className={classes.divider} />
                }
              </Grid>
            }

            {/* Description of segment, this might be changed later */}
            {isXS && <Grid item xs={12} style={{ paddingTop: "5px", paddingBottom: "5px" }}>
              {description !== "" && <InputBase
                className={classes.normalText}
                value={description}
                multiline
                fullWidth={true}
                maxRows={6}
              />}
              {/* <Typography className={classes.normalText} variant="subtitle2"></Typography> segmentdata.update === null || segmentdata.update === undefined ? "Ei kuvausta" : segmentdata.update.Teksti*/}

            </Grid>}
            {(isEnabled(3) || isEnabled(4)) && <Grid item xs={12} sm={12} container>
              <Grid item xs={12} sm={12}>
                <Typography className={classes.smallHeaders} style={{ paddingLeft: "5px" }} variant="body1" component="p" display="inline">Alueen toissijaiset lumityypit</Typography>
              </Grid>

              <Grid item xs={12} sm={12}>
                <Divider className={classes.divider} />
              </Grid>

              {/* Secondary snowtypes */}
              {isEnabled(3) && <Grid item xs={12} sm={6} container>
                <Grid item xs={3} sm={3}>
                  {
                    <CardMedia
                      component={"img"}
                      src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + segmentdata.update.Toissijainen_ID1 + ".svg"}
                      alt="lumityypin logo"
                    />
                  }
                </Grid>
                <Grid item container xs={9} sm={9} className={classes.snowInfo}>
                  <Grid item xs={12} sm={12}>
                    <Typography className={classes.smallHeaders} variant="body1" component="p">
                      {segmentdata.update.Lumi3.Nimi}
                    </Typography>
                  </Grid>
                  {segmentdata.update.Lumi3.Hiihdettavyys !== null && 
                  <Grid item xs={12} sm={12}>
                    <Typography xs={12} sm={12} className={classes.normalText} variant="body2" component="p">
                    Hiihdettävyys
                      <img className={classes.skiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + segmentdata.update.Lumi3.Hiihdettavyys + ".svg"} alt="skiability" />
                    </Typography>
                  </Grid>}
                </Grid>
              </Grid>}

              {isEnabled(4) && <Grid item xs={12} sm={6} container>
                <Grid item xs={3} sm={3}>
                  {
                    <CardMedia
                      component={"img"}
                      src={process.env.PUBLIC_URL + "/icons/snowtypes-and-harms/" + segmentdata.update.Toissijainen_ID2 + ".svg"}
                      alt="lumityypin logo"
                    />
                  }
                </Grid>
                <Grid item container xs={9} sm={9} className={classes.snowInfo}>
                  <Grid item xs={12} sm={12}>
                    <Typography className={classes.smallHeaders} variant="body1" component="p">
                      {segmentdata.update.Lumi4.Nimi}
                    </Typography>
                  </Grid>
                  {segmentdata.update.Lumi4.Hiihdettavyys !== null && 
                  <Grid item xs={12} sm={12}>
                    <Typography xs={12} sm={12} className={classes.normalText} variant="body2" component="p">
                      Hiihdettävyys
                      <img className={classes.skiabilityIcon} src={process.env.PUBLIC_URL + "/icons/skiability/" + segmentdata.update.Lumi4.Hiihdettavyys + ".svg"} alt="skiability" />
                    </Typography>
                  </Grid>}
                </Grid>
              </Grid>}
            </Grid>}

          </Collapse>
        </Grid>}

        {/* Info about latest update time */}
        {!isXS &&
          <Grid item sm={12} container>
            <Grid item sm={5}>
              <Typography className={classes.normalText} align="center" variant="body2" component="p">
                {segmentdata.update === null || segmentdata.update === undefined ? "" : updateInfo}
              </Typography>
            </Grid>
          </Grid >
        }

        {(isXS && (isEnabled(3) || isEnabled(4) || description !== ""))  &&
          <Grid item xs={12} align="center">
            <IconButton
              className = {expanded ? classes.expandOpen : classes.expandClosed}
              style={{ padding: 0 }}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <img src={`${process.env.PUBLIC_URL}/icons/expand.svg`} width="80%" height="15px" alt="expand" fill="black"></img>
            </IconButton>
          </Grid>
        }

      </Grid>
    </Grid>
  );
}

export default SnowRecordView;
