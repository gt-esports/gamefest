class Participant {
    constructor(userId, name, participationPoints = 0, visitedBooths = []) {
      this.userId = userId;
      this.name = name;
      this.participationPoints = participationPoints;
      this.visitedBooths = visitedBooths;
    }
  }
  
export default Participant;