import styled, { css } from "styled-components/macro";

import Button from "../../../Button/Button";

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  justify-self: flex-end;
  margin-top: auto;
`;

const ButtonStyle = css`
  width: calc(50% - 0.5rem);
  height: auto;
  min-height: 3rem;
  white-space: inherit;
  padding: 0.25rem 1rem;
`;

export const BackButton = styled(Button)`
  ${ButtonStyle}
`;

export const SignButton = styled(Button)`
  ${ButtonStyle}
`;
