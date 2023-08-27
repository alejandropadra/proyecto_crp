"""empty message

Revision ID: aa97e5537171
Revises: 19d470adc0d2
Create Date: 2023-07-27 11:40:22.422337

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'aa97e5537171'
down_revision = '19d470adc0d2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('cobranzas', 'codigo')
    op.add_column('users', sa.Column('codigo', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'codigo')
    op.add_column('cobranzas', sa.Column('codigo', mysql.INTEGER(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###