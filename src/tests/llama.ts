// import * as dcl from 'decentraland-api';

// class GreenCubeScene extends dcl.Scene {
//   constructor(props) {
//     super(props);
//     this.state = {
//       position: new dcl.Vector3(0, 0, 0), // initial position of the cube
//       rotation: new dcl.Quaternion(0, 0, 0, 1), // initial rotation of the
// cube
//       scale: new dcl.Vector3(1, 1, 1) // initial size of the cube
//     };
//   }

//   async init() {
//     const greenCube = this.addObject('cube', {
//       position: this.state.position,
//       rotation: this.state.rotation,
//       scale: this.state.scale,
//       color: new dcl.Color(0, 255, 0), // green color
//     });

//     await greenCube.ready; // wait for the cube to load

//     const updatePosition = () => {
//       this.setState({
//         position: new dcl.Vector3(0, 0, -1) // move the cube up by 1 meter
//       });
//     };

//     const updateRotation = () => {
//       this.setState({
//         rotation: new dcl.Quaternion(90, 0, 0, 1) // rotate the cube 90
// degrees around the y-axis
//       });
//     };

//     const updateScale = () => {
//       this.setState({
//         scale: new dcl.Vector3(2, 2, 2) // double the size of the cube
//       });
//     };

//     // add event listeners for button clicks
//     document.getElementById('position').addEventListener('click',
// updatePosition);
//     document.getElementById('rotation').addEventListener('click',
// updateRotation);
//     document.getElementById('scale').addEventListener('click',
// updateScale);
//   }
// }
