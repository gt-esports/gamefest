class Participant {
    constructor(userId, name, participationPoints = 0, visitedBooths = []) {
      this.userId = userId;
      this.name = name;
      this.participationPoints = participationPoints;
      this.teams = {};
      // this.scannedQRCodes = new Set(); // To track scanned QR codes
    }
  }
  
export default Participant;