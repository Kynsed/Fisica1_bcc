# **Pêndulo Simples**

##  Descrição básica do projeto

Este projeto é uma simulação criada para ilustrar o comportamento de um pêndulo simples. O objetivo é fornecer uma visualização gráfica do movimento oscilatório, permitindo o estudo e a compreensão dos conceitos envolvidos. A simulação mostra a trajetória de um pêndulo oscilando em diferentes condições, alterando-se variaveis como gravidade, massa, arrasto.

## Modelo Matemático

O pêndulo simples é um sistema mecânico que consiste em uma massa puntiforme, preso a um fio de massa desprezível e inextensível capaz de oscilar em torno de uma posição fixa. Graças à sua simplicidade, esse pêndulo é bastante usado durante o estudo do movimento harmônico simples. 

Para pequenas oscilações, o pêndulo simples apresenta um comportamento linear, o que significa que sua equação de movimento podem ser descrita por uma equação linear (sem termos ao quadrado ou funções seno e cosseno). No entanto, para oscilações maiores, o comportamento torna-se fortemente não linear, com a introdução de um termo de seno na equação de movimento.

Para modelagem da simulação definimos as seguintes variaveis:

- θ = Angulo do pendulo (vertical = 0)
- R = Comprimento do fio
- T = Tensão no fio
- m = Massa do corpo
- g = Aceleração da gravidade

Iremos deduzir a equação de movimento para o pêndulo a partir do análogo rotacional da segunda lei de Newton para movimento em torno de um eixo fixo, que é 
𝜏 = 𝐼 𝛼, onde 𝜏 é o torque resultante, 𝐼 é a inercia rotacional e 𝛼 é a aceleração angular.

A inércia rotacional em relação ao ponto de suspensão é ![equação](https://latex.codecogs.com/svg.latex?I%20%3D%20mR%5E2). O torque pode ser calculado como o produto vetorial ![Torque Vetorial](https://latex.codecogs.com/svg.latex?\vec{\tau}%20=%20\vec{r}%20\times%20\vec{F}). O módulo do torque devido à gravidade é dado por:

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?%5Ctau%20%3D%20-Rm%20g%20%5Csin%5Ctheta" alt="Torque Gravitacional">
</p>

Assim, temos:

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?-Rm%20g%20%5Csin%5Ctheta%20%3D%20mR%5E2%20%5Calpha" alt="Equação Final">
</p>

A qual simplifica para:

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?\theta''%20=%20-%5Cfrac{g}{R}%20%5Csin%20%5Ctheta" alt="Equação">
</p>

Essa é a nossa EDO para o pêndulo.

---

A maioria das pessoas não estão muito confortáveis com os conceitos de inércia rotacional e torque. Para mostrar que não há nada de novo na versão rotacional da segunda lei de Newton, iremos chegar na EDO acima utilizando a segunda lei de Newton <img src="https://latex.codecogs.com/svg.latex?\vec{F}%20=%20m%20\vec{a}" alt="F = ma">, em um sistema de coordenadas polares. Como veremos, esse metódo envolve um pouco mais de manipulação algébrica.

Considerando uma base ortonomal, ![Versores](https://latex.codecogs.com/svg.latex?\hat{i},%20\hat{j}).

A cinemática do pêndulo é então a seguinte:

- **Posição** :  
  <p align="center">
    <img src="https://latex.codecogs.com/svg.latex?\vec{r}%20%3D%20R%20\sin%20\theta%20\hat{i}%20-%20R%20\cos%20\theta%20\hat{j}" alt="Posição">.
  </p>

- **Velocidade**:  
  <p align="center">
    <img src="https://latex.codecogs.com/svg.latex?\vec{v}%20%3D%20\vec{\dot{r}}%20%3D%20R%20\dot{\theta}%20\cos\theta%20\hat{i}%20+%20R%20\dot{\theta}%20\sin\theta%20\hat{j}" alt="Velocidade">.
  </p>

- **Aceleração** :  
  <p align="center">
    <img src="https://latex.codecogs.com/svg.latex?\vec{a}%20%3D%20\vec{\ddot{r}}%20%3D%20R%20\left(\ddot{\theta}%20\cos\theta%20-%20\dot{\theta}^2%20\sin\theta\right)%20\hat{i}%20+%20R%20\left(\ddot{\theta}%20\sin\theta%20+%20\dot{\theta}^2%20\cos\theta\right)%20\hat{j}" alt="Aceleração">.
  </p>

A posição é obtida por uma aplicação simples de trigonometria. A velocidade e a aceleração são, então, as primeiras e segundas derivadas da posição. Em seguida, desenhamos o diagrama de forças que atuam sobre o corpo. As forças são a tensão na corda T e o peso. Então, podemos escrever a força resultante como:

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?\vec{F}%20=%20T%20\cos%20\theta%20\hat{j}%20-%20T%20\sin%20\theta%20\hat{i}%20-%20mg%20\hat{j}" alt="Força Total">.
</p>

Em seguida aplicando a segunda lei de Newton <img src="https://latex.codecogs.com/svg.latex?\vec{F}%20=%20m%20\vec{a}" alt="F = ma"> e a equação da aceleração que encontramos anteriormente, temos:

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?T%20\cos%20\theta%20\hat{j}%20-%20T%20\sin%20\theta%20\hat{i}%20-%20m%20g%20\hat{j}%20=%20m%20R\left(\theta''%20\cos%20\theta%20\hat{i}%20-%20\theta'^2%20\sin%20\theta%20\hat{i}%20+%20\theta''%20\sin%20\theta%20\hat{j}%20+%20\theta'^2%20\cos%20\theta%20\hat{j}\right)" alt="Equação Vetorial">.
</p>

Escrevendo as componentes vetoriais da equação acima como equações separadas. Isso nos dá duas equações simultâneas: a primeira para o componente \( \mathbf{i} \) e a segunda para o componente \( \mathbf{j} \).

Primeira equação:
  <p align="center">  
     <img src="https://latex.codecogs.com/svg.latex?-T%20%5Csin%20%5Ctheta%20%3D%20m%20R%28%5Cddot%7B%5Ctheta%7D%20%5Ccos%20%5Ctheta%20-%20%5Cdot%7B%5Ctheta%7D%5E2%20%5Csin%20%5Ctheta%29">. (1)
  </p>

Segunda equação:  
  <p align="center">
     <img src="https://latex.codecogs.com/svg.latex?T%20%5Ccos%20%5Ctheta%20-%20m%20g%20%3D%20m%20R%28%5Cddot%7B%5Ctheta%7D%20%5Csin%20%5Ctheta%20+%20%5Cdot%7B%5Ctheta%7D%5E2%20%5Ccos%20%5Ctheta%29">. (2)
  </p>

Agora devemos eliminar a variavel desconhecida \( T \). Multiplicando 1 por \( \cos \theta \) , temos:

 <p align="center">  
  <img src="https://latex.codecogs.com/svg.latex?-T%20%5Csin%20%5Ctheta%20%5Ccos%20%5Ctheta%20%3D%20m%20R%28%5Cddot%7B%5Ctheta%7D%20%5Ccos%5E2%20%5Ctheta%20-%20%5Cdot%7B%5Ctheta%7D%5E2%20%5Csin%20%5Ctheta%20%5Ccos%20%5Ctheta%29">. (1.1)
   </p>

Multiplicando 2 por \( \sin \theta \)
 
 <p align="center"> 
  <img src="https://latex.codecogs.com/svg.latex?T%20%5Ccos%20%5Ctheta%20%5Csin%20%5Ctheta%20-%20m%20g%20%5Csin%20%5Ctheta%20%3D%20m%20R%28%5Cddot%7B%5Ctheta%7D%20%5Csin%5E2%20%5Ctheta%20+%20%5Cdot%7B%5Ctheta%7D%5E2%20%5Csin%20%5Ctheta%20%5Ccos%20%5Ctheta%29">. (1.2)
  </p>

Substituindo \( T \cos \theta \sin \theta \) de 1.1 em 1.2 obtemos:
 
 <p align="center">
   <img src="https://latex.codecogs.com/svg.latex?-%5Cddot%7B%5Ctheta%7D%20%5Ccos%5E2%20%5Ctheta%20%2B%20%5Cdot%7B%5Ctheta%7D%5E2%20%5Csin%20%5Ctheta%20%5Ccos%20%5Ctheta%20%3D%20%5Cddot%7B%5Ctheta%7D%20%5Csin%5E2%20%5Ctheta%20%2B%20%5Cdot%7B%5Ctheta%7D%5E2%20%5Csin%20%5Ctheta%20%5Ccos%20%5Ctheta%20%2B%20%5Cfrac%7Bg%7D%7BR%7D%20%5Csin%20%5Ctheta">.
</p>

Com a identidade trigonométrica \( \cos^2 \theta + \sin^2 \theta = 1 \), isso se simplifica para a equação:

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?\ddot{\theta}%20=%20-\frac{g}{R}%20\sin%20\theta" alt="\ddot{\theta} = -\frac{g}{R} \sin \theta">. (2)
</p>

Como queriamos demonstrar.

---

Existe ainda uma terceira maneira de obtermos a EDO do pendulo simples. Utlizando o método indireto baseado em energia associada com termos "Lagrangeana", "Equação de Euler-Lagrange", "Hamiltoniano", e outros. Não abordaremos esse terceiro método aqui.

---
Para resolver a EDO obtida optamos pelo método numérico para gerar a simulação. Usamos como padrão o método de Runge-Kutta para resolver os sistemas de equações diferenciais ordinárias. Primeiro, definimos uma variável para a velocidade angular 𝜔 = 𝜃′. Em seguida, podemos escrever a equação de segunda ordem (2) como duas equações de primeira ordem.

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?\theta'%20=%20\omega" alt="θ' = ω">.
</p>

<p align="center">
  <img src="https://latex.codecogs.com/svg.latex?\omega'%20=%20-\frac{g}{R}%20\sin%20\theta" alt="ω' = -g/R sin θ">.
</p>

Essa é a forma necessária para para aplicação do método de Runge-Kutta. Apesar desse método numérico ser o padrão o qual a simulção é iniciada, outros métodos podem ser utilizados em tempo real. Estão definidos os seguintes métodos: Euler, Euler modificado, Euler modificado adaptativo, Runge-Kutta adaptativo.

---

## **BÔNUS**

A nossa equação de movimento coincide com a equação 3.1 do livro Chaotic Dynamics: An Introduction - Baker/Gollub. No livro em questão Baker/Gollub estabelece alguns parâmetros para transformar o MHS do pêndulo em um movimento caótico. Tente utlizar o simulador com os seguintes parâmetros:

+ Comprimento do fio = 1.0
+ Massa = 1.0
+ Gravidade = 1.0
+ Amplitude de impulso = 1.15
+ Frequência de impulso = 2/3
+ Arrasto = 0.5

---

## **Aplicações Práticas**

1. **Medida de Tempo:**  
- Relógios de pêndulo aproveitam o período constante do pêndulo para cronometragem precisa.

2. **Engenharia:**  
- Bolas de demolição utilizam princípios semelhantes para maximizar impacto.

3. **Sismologia:**  
- Pêndulos são usados para detectar e medir movimentos sísmicos.

4. **Experimentos de Física:**  
- Determinação da aceleração gravitacional local (g).

---

# Compilação

Neste tópico abordaremos a compilação e execução do programa apenas em ambiente Microsoft Windows.

Para compilar:

  1. Baixe o repositório
      Clique em Code -> Download ZIP para obter os arquivos do projeto.

  2. Instale as ferramentas necessárias

       [Node.js](https://nodejs.org/en)
         Execute o instalador com todas as opções padrão.

      Criando o arquivo package.json:
       - Abra o PowerShell
       - Execute o comando cd -PATH- (substitua -PATH- pelo caminho do repositório baixado na instrução 1).
       - Gere o arquivo package.json com o comando: ```npm init -y```

     Typescript
       - Instale globalmente com o comando  ```npm install -g typescript```
       - Instale o Typescript localmente ```npm install typescript --save-dev```
       - Certifique-se que o Typescript foi instalado corretamente através do comando ```tsc --version```.
       - Criando um alias: ```alias tsc="*diretorio_do_projeto*\node_modules\typescipt\bin\tsc"```     

     Esbuild
        - Instale o esbuild localmente ```npm install --save-exact --save-dev esbuild```
        - Vamos criar um link simbólico. Abra o cmd como administrador e execute
                  ```mklink esbuild node_modules\esbuild\bin\esbuild```
        - Verifique se foi criado corretamente com o comando ```./esbuild --version```
    
     [Perl](https://strawberryperl.com/)
       - Baixe o arquivo .msi e faça a instalação padrão
       - Verfique a instalação com o comando ```perl --version```
    
     [GNU Make](https://www.gnu.org/software/make/)
       - Baixe e instale GNU Make
       - Verifique a instalação com o comando ```make --version```

  4. Execute o comando ```tsc``` para compilar os arquivo .ts em .js

  5. Execute o comando ```make``` para gerar o .html

  6. Abra o diretório do projeto -> build, abra o arquivo index-en.html para inciar a simulação     

---

Este projeto foi desenvolvido por:

- **Kevin Silva** : kelvinr.silv@usp.br
- **Gabriel Demba** : [Email 2]
- **Wiltord Mosingi**: wiltordmosingi@usp.br

Como parte do processo avaliativo da disciplina 7600105 - Física Básica I (2024) da USP-São Carlos ministrada pela(o) [Prof. Krissia de Zawadzki/Esmerindo de Sousa Bernardes]

## **Referências**  
- [1] NEUMANN, Erik. Einfaches Pendel.
- [2] GOLLUB.P Jerry, BAKER.L Gregory. Chaotic Dynamics: An Introduction.
- [3] BERNARDES, Esmerindo de Sousa. Dinâmica-v4 (Notas de aula).
- [4] LEWIN, Walter. For the Love of Physics - Walter Lewin - May 16, 2011. Disponivel em (https://www.youtube.com/watch?v=sJG-rXBbmCc&t=8s).      
         
