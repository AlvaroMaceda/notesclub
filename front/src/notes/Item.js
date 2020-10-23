import * as React from 'react';

export const Item = ({ entity: { username, content } }) => <div>{`${content} · @${username}`}</div>;
