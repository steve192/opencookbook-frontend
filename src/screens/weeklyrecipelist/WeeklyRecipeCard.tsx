import { Text } from '@ui-kitten/components';
import React from 'react';
import { CustomCard } from '../../components/CustomCard';


interface Props {
    title: string
}
export const WeeklyRecipeCard = (props: Props) => {
    return (
        <CustomCard>
            <Text>{props.title}</Text>
        </CustomCard>

    )
}