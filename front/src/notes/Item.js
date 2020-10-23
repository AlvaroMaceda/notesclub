import * as React from 'react';

export const Item = ({ entity: { username, content } }) => <div>{`${username}: ${content}`}</div>;
