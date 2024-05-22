import "./App.css";

import { ChangeEvent, useState } from "react";
import { useEffect } from "react";

import { derivative } from "mathjs";

interface variable {
	symbol: string;
	value: number;
	uncertainty: number;
	isCorrelated: boolean;
}

export default function Gaussian() {
	const [formula, setFormula] = useState<string>("");
	const [symbol, setSymbol] = useState<string>("");
	const [value, setValue] = useState<number>();
	const [uncertainty, setUncertainty] = useState<number>();
	const [result, setResult] = useState<Array<number>>();
	const [isCorrelated, setIsCorrelated] = useState<boolean>(false);
	const [variableList, setVariable] = useState<variable[]>([]);

	//Add variable to Variables List
	const addVariable = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (value == undefined || uncertainty == undefined) {
			return;
		}
		const temp: variable = {
			symbol,
			value,
			uncertainty,
			isCorrelated,
		};
		setVariable([...variableList, temp]);
	};

	//Update the Column Correlated in Variables list
	const updateVarlistCorr = (e: {
		target: {
			value: number;
			closest: (arg0: string) => {
				(): any;
				new (): any;
				parentElement: any;
			};
		};
	}) => {
		//TODO fix update corr values (Toggle atm no row independance/differentiation)
		console.log(e.target.value);
		console.log(e.target.value == 0, e.target.value == 1);
		if (e.target.value == 1) {
			setIsCorrelated(0);
			console.log("set to false");
			console.log(isCorrelated, e.target.value);
		} else if (e.target.value == 0) {
			setIsCorrelated(1);
			console.log("set to true");
			console.log(isCorrelated, e.target.value);
		}
		var col = e.target.closest("td").parentElement;
		const getIndex = (arr: { symbol: any }) =>
			arr.symbol === col.firstChild.textContent;
		variableList[variableList.findIndex(getIndex)].isCorrelated =
			isCorrelated;
		console.log(variableList);
	};

	//Evaluates the formula input and converts it to mathematical function
	function evaluateFormula(
		formula: string,
		variablesLookup: any[] | Map<string, number>
	) {
		formula = formula.replaceAll("^", "**");
		let keys = Array.from(variablesLookup.keys());
		let values = Array.from(variablesLookup.values());
		let func = new Function(...keys, `return ${formula};`);
		return eval(func(...values.map(Number)));
	}

	//The function for the evaluation of the error
	const evaluate = () => {
		let varValues = new Map([]);
		let varUncertainties = new Map([]);
		let derivatives: (string | number)[][] = [];
		let discriminant = "";
		let res = 0;
		let res_uncertainty = 0;

		variableList.forEach((variable) => {
			varValues.set(variable.symbol, variable.value);
			varUncertainties.set(variable.symbol, variable.uncertainty);

			derivatives.push([
				derivative(formula, variable.symbol, {
					simplify: false,
				}).toString(),
				variable.uncertainty,
			]);
		});

		for (let i = 0; i < derivatives.length; i++) {
			discriminant =
				discriminant +
				"(" +
				derivatives[i][0] +
				"*" +
				derivatives[i][1] +
				")^2" +
				" + ";
		}

		discriminant = discriminant.slice(0, discriminant.length - 2);
		res_uncertainty = Math.sqrt(evaluateFormula(discriminant, varValues));

		res = evaluateFormula(formula, varValues);

		setResult([res, res_uncertainty]);
	};

	return (
		<body className="App-body">
			<div className="App-formulaInput">
				<label>Formula:</label>
				<input
					type="text"
					required
					value={formula}
					onChange={(e) => setFormula(e.target.value)}
					id="formula"
				></input>
			</div>

			<form onSubmit={addVariable}>
				<div className="App-varInput">
					<label>Variable:</label>
					<input
						type="text"
						required
						value={symbol}
						onChange={(e) => setSymbol(e.target.value)}
						id="var"
					></input>

					<label>Value:</label>
					<input
						type="text"
						required
						value={value}
						onChange={(e) => setValue(e.target.value)}
						id="var"
					></input>

					<label>Uncertainty:</label>
					<input
						type="text"
						required
						value={uncertainty}
						onChange={(e) => setUncertainty(e.target.value)}
						id="var"
					></input>

					<button className="App-addVariable">+</button>
				</div>
			</form>

			<table className="App-variablesList">
				<thead>
					<tr>
						<th>Variable</th>
						<th>Value</th>
						<th>Uncertainty</th>
						<th>Correlated</th>
					</tr>
				</thead>
				<tbody>
					{variableList.map((variable) => (
						<tr key={variable.symbol}>
							<td>{variable.symbol}</td>
							<td>{variable.value}</td>
							<td>{variable.uncertainty}</td>
							<td>
								<input
									type="checkbox"
									value={isCorrelated}
									onChange={(e) => useUpdateVarlistCorr(e)}
									id="corr"
								></input>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<button className="App-evaluate" onClick={evaluate}>
				Evaluate
			</button>
			<div className="App-results" id="results">
				{result && (
					<p>
						F = {result[0]} <br /> &delta; = {result[1]} (
						{((result[1] / result[0]) * 100).toFixed(2)}%)
					</p>
				)}
			</div>
		</body>
	);
}
