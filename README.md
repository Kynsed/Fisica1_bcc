# **A Dinâmica do Pêndulo**


##  Descrição básica do projeto

Este projeto é uma simulação criada para ilustrar o comportamento de um pêndulo simples na Física. O objetivo é fornecer uma visualização gráfica do movimento oscilatório, permitindo o estudo e a compreensão dos conceitos envolvidos. A simulação mostra a trajetória de um pêndulo oscilando em diferentes condições, como variações no comprimento da corda e na gravidade.


## Conceitos de Física e Modelo Matemático

### Pêndulo Simples
O pêndulo simples é um sistema mecânico que consiste em uma massa puntiforme, ou seja, um corpo com dimensões insignificantes, presa a um fio de massa desprezível e inextensível capaz de oscilar em torno de uma posição fixa. Graças à sua simplicidade, esse pêndulo é bastante usado durante o estudo do movimento harmônico simples. 
O pêndulo simples é uma aproximação em que não existem forças dissipativas, ou seja, forças de atrito ou de arraste, atuando sobre quaisquer componentes do sistema. Nesses pêndulos, o movimento oscilatório surge em decorrência da ação das forças peso e tração, exercida por um fio.
Como as forças peso e tração não se cancelam nesse contexto, já que isso só acontece na posição de equilíbrio, surge, dessa forma, uma força resultante de natureza centrípeta, fazendo o pêndulo oscilar em torno de um ponto de equilíbrio.
A partir das equações horárias do movimento harmônico simples e das leis de Newton, é possível determinar um conjunto de equações exclusivas para os pêndulos simples, para isso, dizemos que a resultante entre a força peso e a força de tração é uma força centrípeta. Além disso, a força restauradora do movimento pendular é a componente horizontal do peso:

![p](https://github.com/user-attachments/assets/64e54e0f-a57e-4ed2-b7f6-108e3bf362b9)

Px - componente horizontal da força peso (N)

Py - componente vertical da força peso (N)

A fórmula mostrada a seguir é usada para calcular o período no pêndulo simples, ela relaciona o tempo de uma oscilação completa ao tamanho do fio e à aceleração da gravidade local.

![p](https://github.com/user-attachments/assets/049ae54a-5ccb-426f-9723-2638cd0af775)


**Suposições Adotadas:**
- O fio é **sem massa** e **inextensível**.  
- O sistema está sob uma **força gravitacional uniforme**.  
- Desconsidera-se a resistência do ar.

---

## **3. Equação do Movimento**

1. A equação geral que rege o movimento do pêndulo:  

![p](https://github.com/user-attachments/assets/e0fe851a-274a-4b1c-84ac-072ec8f04195)


2. Para **pequenos ângulos** (sin(θ) ≈ θ):  


   Esta forma reduzida caracteriza o **movimento harmônico simples**, no qual o pêndulo oscila simetricamente em torno da posição de equilíbrio.

---


## **4. Relações e Efeitos**

### **Comprimento do Fio (L)**
- O comprimento do fio é **inversamente proporcional** à frequência de oscilação.
- **Efeitos:**  
- Aumentar L **aumenta o período** (ciclo mais lento).  
- Diminuir L **reduz o período** (ciclo mais rápido).  

  
Onde:  
- T: Período (tempo para um ciclo completo).  
- L: Comprimento do fio.  
- g: Aceleração gravitacional.


### **Aceleração Gravitacional (g)**
- A aceleração gravitacional **influencia diretamente a velocidade de oscilação**.  
- **Efeitos:**  
- Aumentar g **acelera o pêndulo** (ciclos mais rápidos).  
- Reduzir g **desacelera o pêndulo** (ciclos mais lentos).


### **Amplitude (θ₀)**
- O **ângulo inicial** (θ₀) determina a altura inicial do pêndulo.  
- **Efeitos:**  
- Para **ângulos pequenos** (< 15°), o movimento é harmônico e o período é constante.  
- Para **ângulos grandes**, a aproximação sin(θ) ≈ θ não é válida, resultando em **movimento não linear** e ligeiro aumento no período.


### **Massa da Bobina (m)**
- A **massa da bobina não altera o período** ou a frequência do pêndulo (negligenciando a resistência do ar).  
- Isso ocorre porque a força restauradora (gravidade) e a inércia aumentam proporcionalmente com a massa, anulando sua influência.


## **Energia no Movimento do Pêndulo**

### **Energia Potencial**
- A energia potencial (\(U\)) é a energia armazenada devido à altura do pêndulo em relação à sua posição de equilíbrio.  
- **Equacao:**  
<img src="./potential_energy.png" alt="Energia Potencial" width="300px">

### **Energia Cinética**
- A energia cinética (\(K\)) é a energia associada ao movimento do pêndulo.  
- **Equacao:**  
<img src="./kinetic_energy.png" alt="Energia Cinética" width="300px">

### **Energia Mecânica Total**
- A energia mecânica total (\(E\)) é a soma da energia potencial e cinética do sistema.  
- **Eguacao:**  
<img src="./total_mechanical_energy.png" alt="Energia Mecânica Total" width="300px">

### **Conservação da Energia**
- No movimento de um pêndulo ideal (sem resistência do ar ou atrito), a energia mecânica total é conservada:  
  - **Altura máxima (\(U_{máx}\)):** Toda a energia é potencial.  
  - **Velocidade máxima (\(K_{máx}\)):** Toda a energia é cinética.


## **5. Aplicações Práticas**

1. **Medida de Tempo:**  
- Relógios de pêndulo aproveitam o período constante do pêndulo para cronometragem precisa.

2. **Engenharia:**  
- Bolas de demolição utilizam princípios semelhantes para maximizar impacto.

3. **Sismologia:**  
- Pêndulos são usados para detectar e medir movimentos sísmicos.

4. **Experimentos de Física:**  
- Determinação da aceleração gravitacional local (g).


## **6. Conclusão**

Este projeto é uma aplicação prática dos conceitos teóricos de movimento oscilatório, permitindo explorar as propriedades fundamentais do pêndulo simples por meio de uma abordagem interativa.

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

- **Kevin Silva** : [Email 1]
- **Gabriel Demba** : [Email 2]
- **Wiltord Mosingi**: [wiltordmosingi@usp.br]

Como parte do processo avaliativo da disciplina 7600105 - Física Básica I (2024) da USP-São Carlos ministrada pela(o) [Prof. Krissia de Zawadzki/Esmerindo de Sousa Bernardes]


## **Referências**  
- [1] **Dinâmica-v4 (Notas de aula)**, _7600105 - Física Básica I_ - USP.  
- [2] **Pêndulo Simples e Pêndulo Físico**, UFES.  
  [Acesse o PDF](https://fisica.ufes.br/sites/fisica.ufes.br/files/field/anexo/experiencia_a8_-_pendulo_simples_e_pendulo_fisico.pdf)  
- [3] **Explicação em vídeo**.  
  [Assista no YouTube](https://www.youtube.com/watch?v=sJG-rXBbmCc&t=8s)  

     
         
