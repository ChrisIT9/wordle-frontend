import { FC } from 'react';

import { Board, LetterPosition } from '../../Typings/Misc';
import './index.css';

export const BoardComponent: FC<{
	board: Board;
	currentIndex?: number;
	currentWord?: string;
}> = props => {
	const { board, currentWord, currentIndex } = props;
	return (
		<>
			<div className='board'>
				{Object.entries(board).map(
					([wordIndex, wordPositions]: [
						string,
						{ word: string | undefined; letterPositions: LetterPosition[] }
					]) => (
						<div className='row' key={wordIndex}>
							{wordPositions.letterPositions.map((item, letterIndex) => {
								return (
									<div className={item.replaceAll(' ', '_')} key={letterIndex}>
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
