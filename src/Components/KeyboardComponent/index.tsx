import { FC, memo } from 'react';
import { KeyboardStatus, LetterPosition } from '../../Typings/Misc';
import BackspaceIcon from '@mui/icons-material/Backspace';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './index.css';

const KeyboardComponent: FC<{
	keyboardStatus: KeyboardStatus;
	onClickFn: (event: string) => void;
}> = props => {
	const { keyboardStatus, onClickFn } = props;
	return (
		<div>
			<div className='keyboardRow'>
				{Object.entries(keyboardStatus).map(
					([key, status]: [string, LetterPosition], index) => {
						return index <= 9 ? (
							<button className={`key ${status.replaceAll(' ', '_') + '_KEY'}`} onClick={() => onClickFn(`Key${key}`)}>
								{key}
							</button>
						) : (
							''
						);
					}
				)}
			</div>
			<div className='keyboardRow'>
				{Object.entries(keyboardStatus).map(
					([key, status]: [string, LetterPosition], index) => {
						return index > 9 && index <= 18 ? (
							<button className={`key ${status.replaceAll(' ', '_') + '_KEY'}`} onClick={() => onClickFn(`Key${key}`)}>
								{key}
							</button>
						) : (
							''
						);
					}
				)}
			</div>
			<div className='keyboardRow'>
				{Object.entries(keyboardStatus).map(
					([key, status]: [string, LetterPosition], index) => {
						if (index < 19) return '';
						if (index === 19)
							return (
								<>
									<button className='key EMPTY_KEY' onClick={() => onClickFn('Enter')}>
										<CheckCircleIcon></CheckCircleIcon>
									</button>
									<button className={`key ${status.replaceAll(' ', '_') + '_KEY'}`} onClick={() => onClickFn(`Key${key}`)}>
										{key}
									</button>
								</>
							);
						if (index === 25)
							return (
								<>
									<button className={`key ${status.replaceAll(' ', '_') + '_KEY'}`} onClick={() => onClickFn(`Key${key}`)}>
										{key}
									</button>
									<button className='key EMPTY_KEY' onClick={() => onClickFn('Backspace')}>
										<BackspaceIcon></BackspaceIcon>
									</button>
								</>
							);
						return (
							<button className={`key ${status.replaceAll(' ', '_') + '_KEY'}`} onClick={() => onClickFn(`Key${key}`)}>
								{key}
							</button>
						);
					}
				)}
			</div>
		</div>
	);
};

export const MemoizedKeyboard = memo(KeyboardComponent);
