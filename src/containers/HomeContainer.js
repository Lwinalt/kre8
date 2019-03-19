import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

import { Switch, Route, withRouter } from 'react-router-dom';
import SimpleReactValidator from 'simple-react-validator';

import * as actions from '../store/actions/actions.js';
import * as events from '../../eventTypes';

import HomeComponent from '../components/HomeComponent';
import HelpInfoComponent from '../components/HelpInfoComponent';
import HomeComponentPostCredentials from '../components/HomeComponentPostCredentials';

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      awsAccessKeyId: '',
      awsSecretAccessKey: '',
      awsRegion: 'default',
      text_info:'',
      showInfo: false,
      mouseCoords: {},
      credentialStatus: false,

      
    }

    this.validator = new SimpleReactValidator({
      element: (message, className) => <div className="errorClass">{message}</div>
    });

    this.handleChange = this.handleChange.bind(this);
    this.setAWSCredentials = this.setAWSCredentials.bind(this);
    this.handleAWSCredentials = this.handleAWSCredentials.bind(this);
    this.processAWSCredentialStatus = this.processAWSCredentialStatus.bind(this);
    
    this.displayInfoHandler = this.displayInfoHandler.bind(this);
    this.hideInfoHandler = this.hideInfoHandler.bind(this);

    this.testFormValidation = this.testFormValidation.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleButtonClickOnHomeComponentPostCredentials = this.handleButtonClickOnHomeComponentPostCredentials.bind(this);
  }

  //**--------------COMPONENT LIFECYCLE METHODS-----------------**//

  componentDidMount() {
    ipcRenderer.send(events.CHECK_CREDENTIAL_STATUS, "checking for credentials");
    ipcRenderer.on(events.RETURN_CREDENTIAL_STATUS, this.processAWSCredentialStatus);
    ipcRenderer.on(events.HANDLE_AWS_CREDENTIALS, this.handleAWSCredentials);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(events.HANDLE_AWS_CREDENTIALS, this.handleAWSCredentials);
  }

  //**--------------EVENT HANDLERS-----------------**//

  //HANDLE CHANGE METHOD FOR FORMS
  handleChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }

  handleFormChange(e) {
    this.setState({ "awsRegion": e.target.value });
  }

  //TODO: create credential method

  testFormValidation() {
    if (this.validator.allValid()) {
      // alert(`Your credentials are being validated by Amazon Web Services. This can take up to one minute. Please click ok to continue.`);
      return true;
    } else {
      this.validator.showMessages();
      this.forceUpdate();
      return false;
    }
  }

  //** ------- PROCESS AWS CREDENTIALS ON APPLICATION OPEN ----------- **//

  //if credentials are saved in file, display HomeContainerPostCredentials
  processAWSCredentialStatus(event, data) {
    console.log("credential status: ", data);
    if (data === true) {
      this.setState({ ...this.state, credentialStatus: true });
      this.props.history.push('/cluster');
    } 
    console.log("credentials are not yet entered, send to setup page")
  }

  //** ------- CONFIGURE AWS CREDENTIALS ----------------------------- **//
  //Activates when user enters AWS credentials. If the credentials pass error handlers, 
  //reset values in state, and send data to the main thread to verify entry data with AWS

  setAWSCredentials(e) {
    e.preventDefault();
  
    const awsConfigData = {
      awsAccessKeyId: this.state.awsAccessKeyId,
      awsSecretAccessKey: this.state.awsSecretAccessKey,
      awsRegion: this.state.awsRegion
    }

    if (this.testFormValidation()) {
      console.log("All form data passed validation");
      this.setState({ ...this.state, awsAccessKeyId: '', awsSecretAccessKey: '', awsRegion: ''});
      ipcRenderer.send(events.SET_AWS_CREDENTIALS, awsConfigData);
    } else {
      console.log("Invalid or missing data entry");
    }
    
  }

  //Based on AWS response, either move the user on to the AWS entry page, or send error alert, for user to reenter credentials
  handleAWSCredentials(event, data) {
    // The following is going to be the logic that occurs once a new role was created via the main thread process
    console.log("hellllllloooooooo");

    console.log('incoming text:', data);
    console.log('incoming text:', data.Arn);
    
    if (data.Arn) {
      this.props.history.push('/aws')

    } else {
      alert('The credentials you entered are incorrect. Please check your entries and try again.');
    }
  }

  handleButtonClickOnHomeComponentPostCredentials(e) {
    console.log('button pushed:');
    this.props.history.push('/cluster')
  }

  // MORE INFO BUTTON CLICK HANDLER
  // this should tell info component which text to display
  displayInfoHandler(e){
    const home_info = 'In order to use KRE8 to create and launch your Kubernetes cluster on Amazon’s Elastic Container Service for Kubernetes (EKS), you must have an Amazon Web Services Account. KRE8 needs the below details from your AWS account in order to deploy your cluster. KRE8 will use these details to generate a file titled “credentials” in a folder named .aws in your root directory. AWS will reference this file to verify your permissions as you build your Kubernetes cluster.'

    const x = e.screenX;
    const y = e.screenY;
    const newCoords = {top: y, left: x}
    if(e.target.id === "home_info"){
      this.setState({...this.state, text_info: home_info, mouseCoords: newCoords, showInfo: true})
    }
    // if(buttonId === aws_info_button){
    //   this.setState({...this.state, text_info: aws_info, showInfo: true})
    // }
  }

  //HIDE INFO BUTTON CLICK HANDLER
  hideInfoHandler(){
    this.setState({...this.state, showInfo: false})
  }

  render() { 

    console.log('this.state.awsRegion', this.state.awsRegion);

    return (
      <div className="home_page_container">
        {this.state.showInfo === true && (
        <HelpInfoComponent 
          text_info={this.state.text_info}
          hideInfoHandler={this.hideInfoHandler}
          mouseCoords={this.state.mouseCoords}
        />
        )}
        { (this.state.credentialStatus === true) ?
          <HomeComponentPostCredentials
            handleButtonClickOnHomeComponentPostCredentials={this.handleButtonClickOnHomeComponentPostCredentials}
          /> 
          :
          <HomeComponent 
            handleChange={this.handleChange}
            handleFormChange={this.handleFormChange}
            validator={this.validator}
            awsAccessKeyId={this.state.awsAccessKeyId}
            awsSecretAccessKey={this.state.awsSecretAccessKey}
            awsRegion={this.state.awsRegion}
            setAWSCredentials={this.setAWSCredentials}
            
            displayInfoHandler={this.displayInfoHandler}
            grabCoords={this.grabCoords}
          />
        }
    </div>
    );
  }
}



export default withRouter(connect(null, null)(HomeContainer));