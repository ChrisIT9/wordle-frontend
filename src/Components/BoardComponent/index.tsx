import { FC } from 'react';

import { Board, LetterPosition } from '../../Typings/Misc';
import './index.css';

export const BoardComponent: FC<{
	board: Board;
	currentIndex?: number;
	currentWord?: string;
	opponentBoard?: boolean
}> = props => {
	const { board, currentWord, currentIndex, opponentBoard } = props;
	return (
		<>
			<div className='board' id={opponentBoard ? 'opponentBoard' : undefined}>
				{Object.entries(board).map(
					([wordIndex, wordPositions]: [
						string,
						{ word: string | undefined; letterPositions: LetterPosition[] }
					]) => (
						<div className='row' key={wordIndex}>
							{wordPositions.letterPositions.map((item, letterIndex) => {
								return (
									<div className={'box ' + item.replaceAll(' ', '_')} key={letterIndex}>
										{currentIndex != null &&
										currentWord &&
										currentIndex === Number(wordIndex)
											? currentWord.split('')[letterIndex]
											: wordPositions.word
											? wordPositions.word.split('')[letterIndex]
											: ''}
									</div>
								);
							})}
						</div>
					)
				)}
			</div>
		</>
	);
};
