let BaseErrCode = 2400

module.exports = {
  Err: {
    FA_USER_EXISTS_IN_TEAM: {
      err: BaseErrCode + 1,
      msg: 'User Already Exists In Team'
    },
    FA_TEAM_FULL: {
      err: BaseErrCode + 1,
      msg: 'Team Full'
    },
    FA_INVALID_TEAM: {
      err: BaseErrCode + 1,
      msg: 'Invalid Team'
    }
  }
}
