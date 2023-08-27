"""empty message

Revision ID: 56068cf184a6
Revises: 9b5e43fc72d5
Create Date: 2023-08-20 21:34:52.612222

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '56068cf184a6'
down_revision = '9b5e43fc72d5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_Cobranza_False', table_name='cobranza')
    op.drop_table('cobranza')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('cobranza',
    sa.Column('False', mysql.BIGINT(), autoincrement=False, nullable=True),
    sa.Column('0', mysql.TEXT(), nullable=True),
    sa.Column('1', mysql.TEXT(), nullable=True),
    sa.Column('2', mysql.TEXT(), nullable=True),
    sa.Column('3', mysql.TEXT(), nullable=True),
    sa.Column('4', mysql.TEXT(), nullable=True),
    sa.Column('5', mysql.TEXT(), nullable=True),
    sa.Column('6', mysql.TEXT(), nullable=True),
    sa.Column('7', mysql.TEXT(), nullable=True),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('ix_Cobranza_False', 'cobranza', ['False'], unique=False)
    # ### end Alembic commands ###