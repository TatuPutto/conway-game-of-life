function randomizeAliveCells(dimension, cellCount) {
  let aliveCells = [];
  
  // continue loop until set amount (amount of cells / 4) of unique numbers are generated
  while(aliveCells.length < Math.floor(cellCount / 4)) {
    const aliveCell = Math.floor((Math.random() * cellCount) + 1);
    if(aliveCells.indexOf(aliveCell) === -1) {
      aliveCells.push(aliveCell);
    }
  }
  return aliveCells;
}

function generateCells(cellCount, aliveCells) {
  let cells = [];
  for(let y = 0; y < cellCount; y++) {
    if(aliveCells.indexOf(y) === -1) {
      cells.push({alive: false, newborn: true});   
    } else {
      cells.push({alive: true, newborn: true});
    } 
  }
  return cells;
}


class Application extends React.Component {
  constructor() {
    super();
    this.state = {
      isRunning: true,
      lifespan: 100,
      boardWidth: 60 * 11,
      // create array with length of dimension * dimension and populate every index with "dead" cell
      cells: new Array(60 * 60).fill({alive: false}),
      generations: 0
    };
    this.initializeBoard = this.initializeBoard.bind(this);
    this.toggleExecution = this.toggleExecution.bind(this);
    this.changeLifespan = this.changeLifespan.bind(this);
    this.clearBoard = this.clearBoard.bind(this);
    this.toggleSingleCell = this.toggleSingleCell.bind(this);
    this.restart = this.restart.bind(this);    
    this.addGeneration = this.addGeneration.bind(this);    
    this.cultivateNextGeneration = this.cultivateNextGeneration.bind(this);
  }
  
  componentDidMount() {
    this.initializeBoard();
    this.addGeneration();
  }
  
  initializeBoard() {
    const dimension = this.props.dimension;
    const cellCount = dimension * dimension;
    const aliveCells = randomizeAliveCells(dimension, cellCount);
    const cells = generateCells(cellCount, aliveCells);
    this.setState({cells});  
  }
  
  toggleExecution() {
    this.setState({isRunning: !this.state.isRunning});
  }
  
  changeLifespan(lifespan) {
    this.setState({lifespan});
  }
  
  clearBoard() {
    this.setState({
      isRunning: false,
      cells: new Array(this.props.dimension * this.props.dimension)
          .fill({alive: false}),
      generations: 0
    });
  }
  
  toggleSingleCell(cellNum) {
    const cells = this.state.cells.slice();
    if(cells[cellNum].alive) {
      cells[cellNum] = {alive: false};
    } else {
      cells[cellNum] = {alive: true};
    }
    this.setState({cells});
  }
  
  restart() {
    this.initializeBoard();
    this.setState({isRunning: true, generations: 0});
  }
  
  addGeneration() {
    const _this = this;
    (function add() {
      setTimeout(function() {
        if(_this.state.isRunning) {
          _this.setState({generations: _this.state.generations + 1});
          _this.cultivateNextGeneration();
        }
        add();
      }, _this.state.lifespan);
    })();
  }
  
  cultivateNextGeneration() {
    const dimension = this.props.dimension;
    const cells = this.state.cells;
    // create a reference free copy of cells array
    let nextGeneration = JSON.parse(JSON.stringify(cells));
    
    for(let cell = 0; cell < cells.length; cell++) {
      const secondLastRow = dimension * (dimension - 1) - 1;
      let aliveNeighbours = 0;
      let checkTop = true,
          checkBottom = true,
          checkLeft = true,
          checkRight = true,
          checkTopRight = true,
          checkBottomRight = true,
          checkBottomLeft = true,
          checkTopLeft = true;
      
      // determine which neighbours are outside the grid and should not be checked
      if(cell < dimension) checkTop = false;
      if(cell < dimension || (cell + 1) % dimension === 0) checkTopRight = false;
      if((cell + 1) % dimension === 0) checkRight = false;
      if(cell > secondLastRow || (cell + 1) % dimension === 0) checkBottomRight = false;
      if(cell > secondLastRow) checkBottom = false;
      if(cell % dimension === 0 || cell > secondLastRow) checkBottomLeft = false;
      if(cell % dimension === 0) checkLeft = false;
      if(cell < dimension || cell % dimension === 0) checkTopLeft = false;
      
      // check for alive neighbours
      //top
      if(checkTop && cells[cell - dimension].alive) aliveNeighbours++;
      
      // top right
      if(checkTopRight && cells[cell - dimension + 1].alive) aliveNeighbours++;
      
      // right
      if(checkRight && cells[cell + 1].alive) aliveNeighbours++;

      // bottom right
      if(checkBottomRight && cells[cell + dimension + 1].alive) aliveNeighbours++;
      
      // bottom
      if(checkBottom && cells[cell + dimension].alive) aliveNeighbours++;
   
      // bottom left
      if(checkBottomLeft && cells[cell + dimension - 1].alive) aliveNeighbours++;
      
      //left
      if(checkLeft && cells[cell - 1].alive) aliveNeighbours++;
      
      //top left
      if(checkTopLeft && cells[cell - dimension - 1].alive) aliveNeighbours++;
        
      // do logic for alive cell
      if(cells[cell].alive) {        
        if(aliveNeighbours < 2 || aliveNeighbours > 3) {  
          nextGeneration[cell].alive = false;
        } else {
          nextGeneration[cell].newborn = false;
        }
      } 

      // do logic for dead cell
      else {
        if(aliveNeighbours === 3) {
          nextGeneration[cell].alive = true;
          nextGeneration[cell].newborn = true;
        }
      }        
    }
    this.setState({cells: nextGeneration});
  }
    
  render() {
    return (
      <div className='container'>
        <ElapsedGenerations generations={this.state.generations} />
        <ControlPanel
          isRunning={this.state.isRunning}
          toggleExecution={this.toggleExecution}
          clearBoard={this.clearBoard}
          restart={this.restart}
          lifespan={this.state.lifespan}
          changeLifespan={this.changeLifespan}
          />
        {this.state.cells.length > 0 &&
          <Board
            cells={this.state.cells}
            boardWidth={this.state.boardWidth}
            toggleCell={this.toggleSingleCell}
          />
        }  
      </div>
    );
  }  
}


function ElapsedGenerations(props) {
  return <div className='elapsed-generations'>Generation: {props.generations}</div>;
}


function ControlPanel(props) {
  const slow = props.lifespan === 1000 ? 'slow active' : 'slow';
  const medium = props.lifespan === 500 ? 'medium active' : 'medium';
  const fast = props.lifespan === 100 ? 'fast active' : 'fast';
  
  return (
    <div className='control-panel'>
      <div className='board-controls'>
        <button onClick={props.toggleExecution}>
          {props.isRunning ? 'Pause' : 'Resume'}
        </button>
        <button onClick={props.clearBoard}>
          Clear Board
        </button>
        <button onClick={props.restart}>
          Restart
        </button>
      </div>
      <div className='lifespan-controls'>
        <button className={slow} onClick={() => props.changeLifespan(1000)}>
          Slow
        </button>
        <button className={medium} onClick={() => props.changeLifespan(500)}>
          Medium
        </button>
        <button className={fast} onClick={() => props.changeLifespan(100)}>
          Fast
        </button>
      </div>
    </div>
  );
}


function Board(props) {
  const cells = props.cells.map(function (cell, i) {
    return (
      <Cell 
        cellNum={i}
        alive={cell.alive}
        newborn={cell.newborn}
        toggleCell={props.toggleCell}
      />
    );
  });

  return (
    <div className='board' style={{width: props.boardWidth}}>
      {cells}
    </div>
  );
}


function Cell(props) {
  const alive = props.alive ? 'alive' : 'dead';
  let age = '';
  if(props.alive) {
    age = props.newborn ? 'young' : 'old';
  }

  return (
    <div
      key={props.cellNum.toString()}
      onClick={() => props.toggleCell(props.cellNum)}
      className={'cell ' + alive + ' ' + age}>
    </div>
  );
}

ReactDOM.render(<Application dimension={60} />, document.getElementById('app'));
