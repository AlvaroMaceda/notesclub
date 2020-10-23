function makeUserResponse(user) {
  return {
      id: user.id,
      username: user.username,
      name: user.name
  }
}

export {
  makeUserResponse
}