import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  color: black;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-left: 120px; /* Сдвигаем чуть правее */
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
`;

const ErrorText = styled.p`
  font-size: 18px;
  opacity: 0.8;
`;

function ErrorMessage({ title = 'Ошибка', message = 'Что-то пошло не так. Попробуйте снова позже.' }) {
  return (
    <ErrorContainer>
      <ErrorTitle>{title}</ErrorTitle>
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
}

export default ErrorMessage;